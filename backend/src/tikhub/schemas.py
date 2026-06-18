from pydantic import BaseModel


class VideoAuthor(BaseModel):
    uid: str
    nickname: str | None = None
    sec_uid: str


class VideoStatistics(BaseModel):
    comment_count: int
    digg_count: int
    play_count: int
    share_count: int


class VideoShareInfo(BaseModel):
    share_url: str
    share_link_desc: str


class VideoAddress(BaseModel):
    url_list: list[str]


class Video(BaseModel):
    play_addr: VideoAddress | None = None
    play_addr_h264: VideoAddress | None = None
    play_addr_265: VideoAddress | None = None
    download_addr: VideoAddress | None = None


class AwemeItem(BaseModel):
    aweme_id: str
    desc: str | None = None
    create_time: int  # epoch time
    author: VideoAuthor
    video: Video
    share_info: VideoShareInfo
    duration: int
    caption: str | None = None
    statistics: VideoStatistics


class UserPostVideosData(BaseModel):
    status_code: int
    min_cursor: int
    max_cursor: int
    has_more: int
    aweme_list: list[AwemeItem]


class UserPostVideosResponse(BaseModel):
    code: int
    message: str
    data: UserPostVideosData
