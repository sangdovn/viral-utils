import asyncio
import logging
from datetime import datetime

from aiosqlite import Connection, Row, connect

from src.config import settings
from src.douyin import repository as repo
from src.douyin.schemas import UserCreate, UserStatus, VideoBase

logger = logging.getLogger(__name__)


async def migrate_users(new_db: Connection, old_db: Connection):
    succeed = 0
    failed = 0
    async with old_db.execute("SELECT * FROM users") as cur:
        rows = await cur.fetchall()
    for row in rows:
        data = dict(row)
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
        last_fetched = data.get("last_fetched")
        if last_fetched == "":
            last_fetched = None
        if last_fetched:
            dt = datetime.strptime(last_fetched, "%Y%m%d%H%M%S")
            last_fetched = int(dt.timestamp())
        created_user = await repo.insert_user(
            user=UserCreate(
                sec_uid=data["sec_user_id"],
                name=data.get("name"),
                t_name=data.get("translated_name"),
                status=status,
                niche=data.get("niche"),
                note=data.get("note"),
                last_fetched=last_fetched,
            ),
            db=new_db,
        )
        if not created_user:
            failed += 1
            continue
        succeed += 1
    print(f"✓ Migrated users. Succeed: {succeed}. Failed: {failed}")


async def migrate_videos(new_db: Connection, old_db: Connection):
    succeed = 0
    failed = 0
    async with old_db.execute("SELECT * FROM videos") as cur:
        rows = await cur.fetchall()
    for row in rows:
        data = dict(row)
        create_time = data.get("create_time")
        if create_time:
            dt = datetime.strptime(create_time, "%Y%m%d%H%M%S")
            create_time = int(dt.timestamp())
        db_user = await repo.select_user_by_sec_uid(data["sec_user_id"], db=new_db)
        if not db_user:
            failed += 1
            continue
        created_video = await repo.insert_video(
            video=VideoBase(
                aweme_id=data["video_id"],
                title=data.get("title"),
                t_title=data.get("translated_title"),
                create_time=create_time,
                digg_count=data.get("digg_count"),
                duration=data.get("duration"),
                urls=data.get("urls"),
                is_downloaded=data.get("is_downloaded", False),
                user_id=db_user.id,
            ),
            db=new_db,
        )
        if not created_video:
            failed += 1
            continue
        succeed += 1
    print(f"✓ Migrated videos. Succeed: {succeed}. Failed: {failed}")


async def migrate():
    async with connect(settings.db_path) as new_db:
        async with connect("/Users/sang/databases/subflow.db") as old_db:
            new_db.row_factory = Row
            old_db.row_factory = Row
            await migrate_users(new_db=new_db, old_db=old_db)
            await migrate_videos(new_db=new_db, old_db=old_db)
    print("✓ Done migration\n")


if __name__ == "__main__":
    asyncio.run(migrate())
