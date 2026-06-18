import asyncio

from aiosqlite import connect

from src.config import settings


async def drop():
    if not settings.db_path.exists():
        print("✗ Database not found\n")
        return

    async with connect(settings.db_path) as conn:
        await conn.execute("PRAGMA foreign_keys = OFF")
        tables = await conn.execute_fetchall(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
        for (table,) in tables:
            await conn.execute(f"DROP TABLE IF EXISTS {table}")
            print(f"✓ Dropped table {table}")
        await conn.execute("PRAGMA foreign_keys = ON")
        await conn.commit()

    print("✓ All tables dropped\n")


if __name__ == "__main__":
    asyncio.run(drop())
