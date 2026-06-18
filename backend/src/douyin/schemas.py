from enum import StrEnum

from pydantic import BaseModel


class UserStatus(StrEnum):
    ACTIVE = "active"
    TESTING = "testing"
    PENDING = "pending"
    DROPPED = "dropped"


class FetchUserRequest(BaseModel):
    sec_user_id: str = ""
    max_cursor: int = 0
    count: int = 999


class UserBase(BaseModel):
    sec_uid: str
    name: str | None = None
    translated_name: str | None = None
    status: UserStatus = UserStatus.PENDING
    topic: str | None = None
    niche: str | None = None
    sub_niche: str | None = None
    micro_niche: str | None = None
    note: str | None = None
    last_fetched: int | None = None


class UserCreate(UserBase):
    system_id: int | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    translated_name: str | None = None
    status: UserStatus | None = None
    topic: str | None = None
    niche: str | None = None
    sub_niche: str | None = None
    micro_niche: str | None = None
    note: str | None = None
    last_fetched: int | None = None


class User(UserBase):
    id: int
    system_id: int | None = None
    created_at: int
    updated_at: int


class UserResponse(UserBase):
    id: int
    system_id: int


class VideoBase(BaseModel):
    title: str | None = None
    translated_title: str | None = None
    create_time: int
    digg_count: int
    duration: int | None = None
    urls: str | None = None
    is_downloaded: bool = False


class VideoCreate(VideoBase):
    aweme_id: str
    user_id: int


class VideoUpdate(BaseModel):
    title: str | None = None
    translated_title: str | None = None
    digg_count: int | None = None
    duration: int | None = None
    urls: str | None = None
    is_downloaded: bool | None = None


class Video(VideoBase):
    id: int
    aweme_id: str
    user_id: int
    created_at: int
    updated_at: int
