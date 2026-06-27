from enum import StrEnum

from pydantic import BaseModel

from src.tikhub.constants import DEFAULT_USER_POST_VIDEO_COUNT


class UserStatus(StrEnum):
    ACTIVE = "active"
    TESTING = "testing"
    PENDING = "pending"
    DROPPED = "dropped"


class FetchUserRequest(BaseModel):
    sec_user_id: str = ""
    max_cursor: int = 0
    count: int = DEFAULT_USER_POST_VIDEO_COUNT
    sort_type: int = 0


class UserCreate(BaseModel):
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
    system_id: int | None = None


class User(BaseModel):
    id: int
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
    system_id: int | None = None
    created_at: int
    updated_at: int


class UserResponse(BaseModel):
    id: int
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
    system_id: int | None = None


class VideoCreate(BaseModel):
    aweme_id: str
    title: str | None = None
    translated_title: str | None = None
    create_time: int
    digg_count: int
    duration: int | None = None
    urls: str | None = None
    is_downloaded: bool = False
    user_id: int


class VideoUpdate(BaseModel):
    title: str | None = None
    translated_title: str | None = None
    digg_count: int | None = None
    duration: int | None = None
    urls: str | None = None
    is_downloaded: bool | None = None


class Video(BaseModel):
    id: int
    aweme_id: str
    title: str | None = None
    translated_title: str | None = None
    create_time: int
    digg_count: int
    duration: int | None = None
    urls: str | None = None
    is_downloaded: bool = False
    user_id: int
    created_at: int
    updated_at: int


class VideoResponse(BaseModel):
    id: int
    aweme_id: str
    title: str | None = None
    translated_title: str | None = None
    create_time: int
    digg_count: int
    duration: int | None = None
    urls: str | None = None
    is_downloaded: bool = False
    user_id: int


class VideoPage(BaseModel):
    items: list[VideoResponse]
    total: int
    limit: int
    offset: int
