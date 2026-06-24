import asyncio
from pathlib import Path

import aiosqlite

from src.douyin.repository import (
    insert_video,
    select_users_to_fetch,
    select_videos_to_download,
    update_video_by_id,
)
from src.douyin.schemas import VideoCreate, VideoUpdate

SCHEMA_DIR = Path(__file__).resolve().parents[1] / "migrations" / "schemas"


async def _connect_db(tmp_path):
    db_path = tmp_path / "test.db"
    conn = await aiosqlite.connect(db_path)
    conn.row_factory = aiosqlite.Row
    for schema in sorted(SCHEMA_DIR.glob("*.sql")):
        await conn.executescript(schema.read_text())
    await conn.commit()
    return conn


def test_select_users_to_fetch_filters_by_status_and_last_fetched(tmp_path):
    async def run():
        db = await _connect_db(tmp_path)
        try:
            await db.executemany(
                """
                INSERT INTO users (sec_uid, status, last_fetched)
                VALUES (:sec_uid, :status, :last_fetched)
                """,
                [
                    {
                        "sec_uid": "active-never",
                        "status": "active",
                        "last_fetched": None,
                    },
                    {"sec_uid": "active-old", "status": "active", "last_fetched": 1},
                    {
                        "sec_uid": "active-current",
                        "status": "active",
                        "last_fetched": 4102444800,
                    },
                    {
                        "sec_uid": "testing-never",
                        "status": "testing",
                        "last_fetched": None,
                    },
                    {"sec_uid": "testing-old", "status": "testing", "last_fetched": 1},
                    {"sec_uid": "pending", "status": "pending", "last_fetched": None},
                    {"sec_uid": "dropped", "status": "dropped", "last_fetched": None},
                ],
            )
            await db.commit()

            users = await select_users_to_fetch(db)

            assert {user.sec_uid for user in users} == {
                "active-never",
                "active-old",
                "testing-never",
            }
        finally:
            await db.close()

    asyncio.run(run())


def test_video_update_persists_metadata_and_download_selection(tmp_path):
    async def run():
        db = await _connect_db(tmp_path)
        try:
            await db.execute(
                "INSERT INTO users (sec_uid, status) VALUES (:sec_uid, :status)",
                {"sec_uid": "user-1", "status": "active"},
            )
            await db.commit()
            user_id = (await (await db.execute("SELECT id FROM users")).fetchone())[
                "id"
            ]

            video = await insert_video(
                VideoCreate(
                    aweme_id="video-1",
                    title="old title",
                    translated_title="old translated",
                    create_time=1,
                    digg_count=1,
                    duration=10,
                    urls='["old"]',
                    is_downloaded=False,
                    user_id=user_id,
                ),
                db,
            )
            assert video is not None

            updated = await update_video_by_id(
                video.id,
                VideoUpdate(
                    title="new title",
                    translated_title="new translated",
                    digg_count=99,
                    duration=20,
                    urls='["new"]',
                    is_downloaded=False,
                ),
                db,
            )

            assert updated is not None
            assert updated.title == "new title"
            assert updated.translated_title == "new translated"
            assert updated.digg_count == 99
            assert updated.duration == 20
            assert updated.urls == '["new"]'

            videos = await select_videos_to_download(db)
            assert [item.aweme_id for item in videos] == ["video-1"]
        finally:
            await db.close()

    asyncio.run(run())
