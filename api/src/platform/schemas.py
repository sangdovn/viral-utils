from enum import StrEnum

from pydantic import BaseModel

from src.system.schemas import System


class PlatformType(StrEnum):
    FACEBOOK = "facebook"
    TIKTOK = "tiktok"
    YOUTUBE = "youtube"


class PlatformStatus(StrEnum):
    ACTIVE = "active"
    RESTRICTED = "restricted"
    SUSPENDED = "suspended"
    BANNED = "banned"


class Platform(BaseModel):
    id: int
    type: PlatformType
    name: str
    url: str | None = None
    status: PlatformStatus
    reason: str | None = None
    system_id: int | None = None
    created_at: int
    updated_at: int


class PlatformCreate(BaseModel):
    type: PlatformType
    name: str
    url: str | None = None
    status: PlatformStatus
    reason: str | None = None
    system_id: int | None = None


class PlatformUpdate(BaseModel):
    type: PlatformType | None = None
    name: str | None = None
    url: str | None = None
    status: PlatformStatus | None = None
    reason: str | None = None
    system_id: int | None = None


class PlatformResponse(BaseModel):
    id: int
    type: PlatformType
    name: str
    url: str | None = None
    status: PlatformStatus
    reason: str | None = None
    system: System | None = None
