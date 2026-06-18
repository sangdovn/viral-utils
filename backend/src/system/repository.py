from aiosqlite import Connection

from src.system.queries import (
    INSERT_SYSTEM,
    SELECT_SYSTEM_BY_ID,
    SELECT_SYSTEMS,
    UPDATE_SYSTEM_BY_ID,
)
from src.system.schemas import System, SystemCreate, SystemUpdate


async def select_systems(db: Connection) -> list[System]:
    cur = await db.execute(SELECT_SYSTEMS)
    rows = await cur.fetchall()
    return [System.model_validate(dict(row)) for row in rows]


async def select_system_by_id(system_id: int, db: Connection) -> System | None:
    cur = await db.execute(SELECT_SYSTEM_BY_ID, {"id": system_id})
    row = await cur.fetchone()
    return System.model_validate(dict(row)) if row else None


async def insert_system(system: SystemCreate, db: Connection) -> System | None:
    cur = await db.execute(INSERT_SYSTEM, system.model_dump())
    await db.commit()
    if not cur.lastrowid:
        return None
    return await select_system_by_id(system_id=cur.lastrowid, db=db)


async def update_system_by_id(
    system_id: int, system: SystemUpdate, db: Connection
) -> System | None:
    existing = await select_system_by_id(system_id=system_id, db=db)
    if not existing:
        return None

    updated = existing.model_copy(update=system.model_dump(exclude_unset=True))
    await db.execute(UPDATE_SYSTEM_BY_ID, updated.model_dump())
    await db.commit()
    return updated


async def delete_system_by_id(system_id: int, db: Connection) -> bool:
    existing = await select_system_by_id(system_id=system_id, db=db)
    if not existing:
        return False

    await db.execute(UPDATE_SYSTEM_BY_ID, {"id": system_id})
    await db.commit()
    return True
