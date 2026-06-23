from aiosqlite import Connection

from src.platform.queries import (
    DELETE_PLATFORM_BY_ID,
    INSERT_PLATFORM,
    SELECT_PLATFORM_BY_ID,
    SELECT_PLATFORMS,
    UPDATE_PLATFORM_BY_ID,
)
from src.platform.schemas import Platform, PlatformCreate, PlatformUpdate


async def select_platforms(db: Connection) -> list[Platform]:
    cur = await db.execute(SELECT_PLATFORMS)
    rows = await cur.fetchall()
    return [Platform.model_validate(dict(row)) for row in rows]


async def select_platform_by_id(platform_id: int, db: Connection) -> Platform | None:
    cur = await db.execute(SELECT_PLATFORM_BY_ID, {"id": platform_id})
    row = await cur.fetchone()
    return Platform.model_validate(dict(row)) if row else None


async def insert_platform(platform: PlatformCreate, db: Connection) -> Platform | None:
    cur = await db.execute(INSERT_PLATFORM, platform.model_dump())
    await db.commit()
    if not cur.lastrowid:
        return None
    return await select_platform_by_id(platform_id=cur.lastrowid, db=db)


async def update_platform_by_id(
    platform_id: int, platform: PlatformUpdate, db: Connection
) -> Platform | None:
    existing = await select_platform_by_id(platform_id=platform_id, db=db)
    if not existing:
        return None

    updated = existing.model_copy(update=platform.model_dump(exclude_unset=True))
    await db.execute(UPDATE_PLATFORM_BY_ID, updated.model_dump())
    await db.commit()
    return updated


async def delete_platform_by_id(platform_id: int, db: Connection) -> bool:
    existing = await select_platform_by_id(platform_id=platform_id, db=db)
    if not existing:
        return False

    await db.execute(DELETE_PLATFORM_BY_ID, {"id": platform_id})
    await db.commit()
    return True
