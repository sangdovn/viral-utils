import asyncio
import sys
from datetime import datetime

from aiosqlite import Connection, Row, connect

from src.config import settings
from src.douyin import repository as repo
from src.douyin.schemas import UserCreate, UserStatus, VideoCreate


async def migrate_users(new_db: Connection, old_db: Connection):
    cur = await old_db.execute("SELECT * FROM users")
    rows = await cur.fetchall()
    if not rows:
        print("Migrate users - No user found")
        return

    existing_cur = await new_db.execute("SELECT sec_uid FROM users")
    existing_rows = await existing_cur.fetchall()
    existing_sec_uids = {row["sec_uid"] for row in existing_rows}

    succeed = 0
    failed = 0
    skipped = 0
    for row in rows:
        data = dict(row)
        sec_uid = data["sec_user_id"]

        if sec_uid in existing_sec_uids:
            skipped += 1
            continue

        status = UserStatus.PENDING
        match data["status"]:
            case "main":
                status = UserStatus.ACTIVE
            case "test":
                status = UserStatus.TESTING
            case "pending":
                status = UserStatus.PENDING
            case "drop":
                status = UserStatus.DROPPED
            case _:
                print(f"Missing user status - {sec_uid}")
                status = UserStatus.PENDING

        try:
            saved = await repo.insert_user(
                user=UserCreate(
                    sec_uid=sec_uid,
                    name=data["name"],
                    translated_name=data["translated_name"],
                    status=status,
                    niche=data["niche"],
                    note=data["note"],
                    last_fetched=None,
                ),
                db=new_db,
            )
        except Exception as e:
            print(f"Failed to insert user - sec_uid={sec_uid} - error={e}")
            failed += 1
            continue

        if not saved:
            failed += 1
            continue
        succeed += 1

    print(
        f"✓ Migrated users."
        f" Succeed: {succeed}."
        f" Failed: {failed}."
        f" Skipped (already migrated): {skipped}"
    )


async def migrate_videos(new_db: Connection, old_db: Connection):
    video_cur = await old_db.execute("SELECT * FROM videos")
    old_db_video_rows = await video_cur.fetchall()
    if not old_db_video_rows:
        print("No video found")
        return

    user_cur = await new_db.execute("SELECT * FROM users")
    user_rows = await user_cur.fetchall()
    if not user_rows:
        print("Migrate videos - No user found")
        return

    new_db_users = [dict(row) for row in user_rows]
    user_id_by_sec_uids = {u["sec_uid"]: u["id"] for u in new_db_users}

    existing_cur = await new_db.execute("SELECT aweme_id FROM videos")
    existing_rows = await existing_cur.fetchall()
    existing_aweme_ids = {row["aweme_id"] for row in existing_rows}

    succeed = 0
    failed = 0
    skipped = 0
    for row in old_db_video_rows:
        data = dict(row)
        video_id = data["video_id"]

        if video_id in existing_aweme_ids:
            skipped += 1
            continue

        user_id = user_id_by_sec_uids.get(data["sec_user_id"])
        if user_id is None:
            print(f"skipping video - user_id not found - {video_id}")
            failed += 1
            continue

        try:
            dt = datetime.strptime(data["create_time"], "%Y%m%d%H%M%S")
            create_time = int(dt.timestamp())
        except (ValueError, TypeError) as e:
            print(f"skipping video - bad create_time - video_id={video_id} - error={e}")
            failed += 1
            continue
        try:
            saved = await repo.insert_video(
                video=VideoCreate(
                    aweme_id=video_id,
                    title=data["title"],
                    t_title=data["translated_title"],
                    create_time=create_time,
                    digg_count=data["digg_count"],
                    duration=data["duration"],
                    urls=data["urls"],
                    is_downloaded=bool(data["is_downloaded"]),
                    user_id=user_id,
                ),
                db=new_db,
            )
        except Exception as e:
            print(f"Failed to insert video - video_id={video_id} - error={e}")
            failed += 1
            continue

        if not saved:
            failed += 1
            continue
        succeed += 1
    print(
        f"✓ Migrated videos."
        f" Succeed: {succeed}."
        f" Failed: {failed}."
        f" Skipped (already migrated): {skipped}"
    )


async def migrate():
    try:
        async with (
            connect(settings.db_path) as new_db,
            connect(settings.old_db_path) as old_db,
        ):
            new_db.row_factory = Row
            old_db.row_factory = Row
            await migrate_users(new_db=new_db, old_db=old_db)
            await migrate_videos(new_db=new_db, old_db=old_db)
    except Exception as e:
        print(f"✗ Migration aborted due to unexpected error: {e}")
        sys.exit(1)

    print("✓ Done migration\n")


if __name__ == "__main__":
    asyncio.run(migrate())
