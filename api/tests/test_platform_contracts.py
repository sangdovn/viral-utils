import asyncio
from pathlib import Path

import aiosqlite

from src.douyin.schemas import UserResponse
from src.platform.repository import insert_platform
from src.platform.router import get_platform
from src.platform.schemas import (
    PlatformCreate,
    PlatformResponse,
    PlatformStatus,
    PlatformType,
    PlatformUpdate,
)
from src.system.repository import insert_system, update_system_by_id
from src.system.schemas import SystemCreate, SystemUpdate

SCHEMA_DIR = Path(__file__).resolve().parents[1] / "migrations" / "schemas"


async def _connect_db(tmp_path):
    db_path = tmp_path / "test.db"
    conn = await aiosqlite.connect(db_path)
    conn.row_factory = aiosqlite.Row
    for schema in sorted(SCHEMA_DIR.glob("*.sql")):
        await conn.executescript(schema.read_text())
    await conn.commit()
    return conn


def test_platform_create_accepts_system_id_and_response_accepts_nested_system(tmp_path):
    async def run():
        db = await _connect_db(tmp_path)
        try:
            system = await insert_system(
                SystemCreate(name="Core", description=None), db
            )
            assert system is not None

            platform = await insert_platform(
                PlatformCreate(
                    type=PlatformType.TIKTOK,
                    name="Channel",
                    status=PlatformStatus.ACTIVE,
                    system_id=system.id,
                ),
                db,
            )
            assert platform is not None
            assert platform.system_id == system.id

            response = PlatformResponse(
                **platform.model_dump(exclude={"system_id"}),
                system=system,
            )
            assert response.system is not None
            assert response.system.id == system.id
        finally:
            await db.close()

    asyncio.run(run())


def test_user_response_allows_missing_system_id():
    response = UserResponse(id=1, sec_uid="sec-uid")

    assert response.system_id is None


def test_system_update_allows_partial_updates(tmp_path):
    async def run():
        db = await _connect_db(tmp_path)
        try:
            system = await insert_system(
                SystemCreate(name="Core", description="old"),
                db,
            )
            assert system is not None

            updated = await update_system_by_id(
                system_id=system.id,
                system=SystemUpdate(description="new"),
                db=db,
            )

            assert updated is not None
            assert updated.name == "Core"
            assert updated.description == "new"
        finally:
            await db.close()

    asyncio.run(run())


def test_platform_update_allows_partial_updates():
    update = PlatformUpdate(reason="manual review")

    assert update.model_dump(exclude_unset=True) == {"reason": "manual review"}


def test_get_platform_includes_nested_system(tmp_path):
    async def run():
        db = await _connect_db(tmp_path)
        try:
            system = await insert_system(
                SystemCreate(name="Core", description=None),
                db,
            )
            assert system is not None

            platform = await insert_platform(
                PlatformCreate(
                    type=PlatformType.TIKTOK,
                    name="Channel",
                    status=PlatformStatus.ACTIVE,
                    system_id=system.id,
                ),
                db,
            )
            assert platform is not None

            response = await get_platform(platform_id=platform.id, db=db)

            assert response.system is not None
            assert response.system.id == system.id
            assert response.system.name == system.name
        finally:
            await db.close()

    asyncio.run(run())
