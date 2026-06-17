from enum import StrEnum

from pydantic import BaseModel


class PlatformType(StrEnum):
    FACEBOOK = "facebook"
    TIKTOK = "tiktok"
    YOUTUBE = "youtube"


class PlatformStatus(StrEnum):
    ACTIVE = "active"
    RESTRICTRED = "restricted"
    SUSPENDED = "suspended"
    BANNED = "banned"


class PlatformBase(BaseModel):
    type: PlatformType
    name: str
    url: str | None = None
    status: PlatformStatus


class Platform(BaseModel):
    id: int
    system_id: int
    created_at: int
    updated_at: int


class PlatformCreate(PlatformBase):
    pass


class PlatformUpdate(BaseModel):
    type: PlatformType
    name: str
    url: str | None = None
    status: PlatformStatus


class PlatformResponse(PlatformBase):
    id: int
    system_id: int
