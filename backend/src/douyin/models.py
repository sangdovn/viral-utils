from pydantic import BaseModel

from src.douyin.schemas import UserStatus


class User(BaseModel):
    id: int
    sec_uid: str
    name: str | None = None
    t_name: str | None = None
    status: UserStatus
    topic: str | None = None
    niche: str | None = None
    sub_niche: str | None = None
    micro_niche: str | None = None
    note: str | None = None
    last_fetched: int | None = None
    created_at: int
    updated_at: int


class Video(BaseModel):
    id: int
    aweme_id: str
    title: str | None = None
    t_title: str | None = None
    create_time: int | None = None
    digg_count: int | None = None
    duration: int | None = None
    urls: str | None = None  # JSON string
    is_downloaded: bool
    user_id: int
    created_at: int
    updated_at: int
