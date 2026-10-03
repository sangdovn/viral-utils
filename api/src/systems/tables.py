from uuid import uuid4

from sqlalchemy import BigInteger, Column, String, Table, Text, Uuid

from src.database import metadata, now

systems = Table(
    "systems",
    metadata,
    Column("id", Uuid(as_uuid=True), default=uuid4, primary_key=True),
    Column("name", String(256), nullable=False, unique=True),
    Column("description", Text),
    Column("search_text", Text),
    Column("created_at", BigInteger, default=now, nullable=False),
    Column("updated_at", BigInteger, default=now, onupdate=now, nullable=False),
)
