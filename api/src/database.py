from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncConnection, create_async_engine

from src.config import get_settings

engine = create_async_engine(get_settings().async_database_url)


async def get_db() -> AsyncGenerator[AsyncConnection]:
    async with engine.begin() as conn:
        yield conn


DB = Annotated[AsyncConnection, Depends(get_db)]
