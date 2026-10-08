from datetime import UTC, datetime

from pydantic import UUID4, BaseModel, field_validator

from src.types import SystemName


class System(BaseModel):
    id: UUID4
    name: SystemName
    description: str | None
    search_text: str | None
    created_at: datetime
    updated_at: datetime

    @field_validator("created_at", "updated_at")
    @classmethod
    def ensure_utc(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value.astimezone(UTC)


class SystemCreate(BaseModel):
    name: SystemName
    description: str | None


class SystemUpdate(SystemCreate):
    pass
