import asyncio
from pathlib import Path

import aiosqlite

from src.douyin.schemas import UserResponse
from src.platform.repository import insert_platform
from src.platform.schemas import (
    PlatformCreate,
    PlatformResponse,
    PlatformStatus,
    PlatformType,
)
from src.system.repository import insert_system
from src.system.schemas import SystemCreate

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
