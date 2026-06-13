import logging

from aiosqlite import Connection

from src.douyin.models import User, Video
from src.douyin.queries import (
    SELECT_ACTIVE_USERS,
    SELECT_USER_BY_ID,
    SELECT_USER_BY_SEC_UID,
    SELECT_USERS,
    SELECT_VIDEO_BY_AWEME_ID,
    SELECT_VIDEO_BY_ID,
    SELECT_VIDEOS,
    SELECT_VIDEOS_BY_USER_ID,
    UPSERT_USER,
    UPSERT_VIDEO,
)
from src.douyin.schemas import (
    UserBase,
    VideoBase,
)

logger = logging.getLogger(__name__)


# ==============================================================================
# USER
# ==============================================================================


async def select_users(db: Connection) -> list[User]:
    cur = await db.execute(SELECT_USERS)
    rows = await cur.fetchall()
    return [User(**dict(row)) for row in rows]


async def select_active_users(db: Connection) -> list[User]:
    cur = await db.execute(SELECT_ACTIVE_USERS)
    rows = await cur.fetchall()
    return [User(**dict(row)) for row in rows]


async def select_user_by_id(user_id: int, db: Connection) -> User | None:
    cur = await db.execute(SELECT_USER_BY_ID, {"id": user_id})
    row = await cur.fetchone()
    return User(**dict(row)) if row else None


async def select_user_by_sec_uid(sec_uid: str, db: Connection) -> User | None:
    cur = await db.execute(SELECT_USER_BY_SEC_UID, {"sec_uid": sec_uid})
    row = await cur.fetchone()
    return User(**dict(row)) if row else None


async def upsert_user(user: UserBase, db: Connection) -> User | None:
    await db.execute(UPSERT_USER, user.model_dump())
    await db.commit()
    return await select_user_by_sec_uid(sec_uid=user.sec_uid, db=db)


# ==============================================================================
# VIDEO
# ==============================================================================


async def select_videos(db: Connection) -> list[Video]:
    cur = await db.execute(SELECT_VIDEOS)
    rows = await cur.fetchall()
    return [Video(**dict(row)) for row in rows]


async def select_video_by_id(video_id: int, db: Connection) -> Video | None:
    cur = await db.execute(SELECT_VIDEO_BY_ID, {"id": video_id})
    row = await cur.fetchone()
    return Video(**dict(row)) if row else None


async def select_video_by_aweme_id(aweme_id: str, db: Connection) -> Video | None:
    cur = await db.execute(SELECT_VIDEO_BY_AWEME_ID, {"aweme_id": aweme_id})
    row = await cur.fetchone()
    return Video(**dict(row)) if row else None


async def select_videos_by_user_id(user_id: int, db: Connection) -> list[Video]:
    cur = await db.execute(SELECT_VIDEOS_BY_USER_ID, {"user_id": user_id})
    rows = await cur.fetchall()
    return [Video(**dict(row)) for row in rows]


async def upsert_video(video: VideoBase, db: Connection) -> Video | None:
    await db.execute(UPSERT_VIDEO, video.model_dump())
    await db.commit()
    return await select_video_by_aweme_id(aweme_id=video.aweme_id, db=db)
