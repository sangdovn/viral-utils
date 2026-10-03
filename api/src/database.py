import time
from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlalchemy import (
    Connection,
    MetaData,
    create_engine,
    event,
)
from sqlalchemy.engine import Engine
from sqlalchemy.engine.interfaces import DBAPIConnection

from src.config import settings

metadata = MetaData(
    naming_convention={
        "pk": "pk_%(table_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ix": "ix_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
    }
)


def now() -> int:
    return int(time.time())


engine: Engine = create_engine(settings.db_url)


def enable_foreign_keys(dbapi_connection: DBAPIConnection, _) -> None:
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys = ON")
    cursor.close()


if engine.dialect.name == "sqlite":
    event.listen(engine, "connect", enable_foreign_keys)


def get_conn() -> Generator[Connection, None, None]:
    with engine.begin() as conn:
        yield conn


DbConnection = Annotated[Connection, Depends(get_conn)]
