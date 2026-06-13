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


class CreateUserAndVideosRequest(BaseModel):
    url: str
    topic: str | None = None
    niche: str | None = None
    sub_niche: str | None = None
    micro_niche: str | None = None
    note: str | None = None


class UserBase(BaseModel):
    sec_uid: str
    name: str | None = None
    t_name: str | None = None
    status: UserStatus = UserStatus.PENDING
    topic: str | None = None
    niche: str | None = None
    sub_niche: str | None = None
    micro_niche: str | None = None
    note: str | None = None
    last_fetched: int | None = None


class UserCreate(UserBase):
    pass


class UserUpdate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    pass


# --- VIDEO ---
class VideoBase(BaseModel):
    aweme_id: str
    title: str | None = None
    t_title: str | None = None
    create_time: int | None = None
    digg_count: int | None = None
    duration: int | None = None
    urls: str | None = None
    is_downloaded: bool
    user_id: int


class VideoCreate(VideoBase):
    pass


class VideoUpdate(VideoBase):
    pass
