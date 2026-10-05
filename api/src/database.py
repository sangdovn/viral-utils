from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from src.config import get_settings
from src.schemas import Base

engine = create_engine(get_settings().database_url, echo=True)


def create_db_and_tables():
    Base.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
