from collections.abc import AsyncGenerator
from pathlib import Path

from aiosqlite import Connection, Row, connect

from src.config import settings


async def init_db():
    async with connect(settings.db_path) as conn:
        files = sorted(Path("migrations/schemas").glob("*.sql"))
        for f in files:
            await conn.executescript(f.read_text())
        await conn.commit()  # commit once at the end


async def get_db() -> AsyncGenerator[Connection]:
    async with connect(settings.db_path) as conn:
        await conn.execute("PRAGMA foreign_keys = ON")
        conn.row_factory = Row  # returns dict-like rows
        yield conn
