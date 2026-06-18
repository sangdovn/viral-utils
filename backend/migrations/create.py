import asyncio
from pathlib import Path

import aiosqlite

from src.config import settings

MIGRATIONS_DIR = Path.cwd() / "migrations" / "schemas"
CREATE_MIGRATIONS_TABLE = """
CREATE TABLE IF NOT EXISTS migrations(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at INTEGER NOT NULL DEFAULT (unixepoch())
)
"""


async def create():
    settings.db_path.parent.mkdir(parents=True, exist_ok=True)

    async with aiosqlite.connect(settings.db_path) as conn:
        await conn.executescript(CREATE_MIGRATIONS_TABLE)

        applied = {
            row[0] for row in await conn.execute_fetchall("SELECT name FROM migrations")
        }

        files = sorted(Path(MIGRATIONS_DIR).glob("*.sql"))

        if not files:
            print("No migrations found")
            return

        for file in files:
            if file.name in applied:
                print(f"Skipping {file.name} - already applied")
                continue

            try:
                await conn.executescript(file.read_text())
                await conn.execute(
                    "INSERT INTO migrations (name) VALUES (?)", [file.name]
                )
                await conn.commit()
                print(f"✓ Applied {file.name}")
            except Exception as e:
                await conn.rollback()
                print(f"✗ Failed {file.name}: {e}")
                raise

        print("✓ Database created\n")


if __name__ == "__main__":
    asyncio.run(create())
