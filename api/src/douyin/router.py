from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from src.database import DbConnection
from src.douyin import repository as repo
from src.douyin.schemas import (
    UserCreate,
    UserResponse,
    UserStatus,
    UserUpdate,
    Video,
    VideoCreate,
    VideoPage,
    VideoResponse,
    VideoUpdate,
)

router = APIRouter(prefix="/douyin")


def _to_video_response(video: Video) -> VideoResponse:
    return VideoResponse.model_validate(video.model_dump())


@router.get("/user-statuses")
async def list_user_statuses() -> list[UserStatus]:
    return list(UserStatus)


@router.get("/users")
async def list_users(db: DbConnection) -> list[UserResponse]:
    users = await repo.select_users(db=db)
    return [UserResponse.model_validate(user.model_dump()) for user in users]


@router.post("/users")
async def create_user(user: UserCreate, db: DbConnection) -> UserResponse:
    existing = await repo.select_user_by_sec_uid(sec_uid=user.sec_uid, db=db)
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")

    created = await repo.insert_user(user=user, db=db)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create user")
    return UserResponse.model_validate(created.model_dump())


@router.get("/users/{user_id}")
async def get_user(user_id: int, db: DbConnection) -> UserResponse:
    user = await repo.select_user_by_id(user_id=user_id, db=db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user.model_dump())


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user: UserUpdate,
    db: DbConnection,
) -> UserResponse:
    updated = await repo.update_user_by_id(user_id=user_id, user=user, db=db)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(updated.model_dump())


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int, db: DbConnection) -> None:
    deleted = await repo.delete_user_by_id(user_id=user_id, db=db)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")


@router.get("/videos")
async def list_videos(db: DbConnection) -> list[VideoResponse]:
    videos = await repo.select_videos(db=db)
    return [_to_video_response(video) for video in videos]


@router.get("/videos/page")
async def list_videos_page(
    db: DbConnection,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> VideoPage:
    items = await repo.select_videos_page(limit=limit, offset=offset, db=db)
    total = await repo.count_videos(db=db)
    return VideoPage(
        items=[_to_video_response(video) for video in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("/videos")
async def create_video(video: VideoCreate, db: DbConnection) -> VideoResponse:
    user = await repo.select_user_by_id(user_id=video.user_id, db=db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    created = await repo.insert_video(video=video, db=db)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create video")
    return _to_video_response(created)


@router.get("/videos/{video_id}")
async def get_video(video_id: int, db: DbConnection) -> VideoResponse:
    video = await repo.select_video_by_id(video_id=video_id, db=db)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return _to_video_response(video)


@router.put("/videos/{video_id}")
async def update_video(
    video_id: int,
    video: VideoUpdate,
    db: DbConnection,
) -> VideoResponse:
    updated = await repo.update_video_by_id(video_id=video_id, video=video, db=db)
    if not updated:
        raise HTTPException(status_code=404, detail="Video not found")
    return _to_video_response(updated)


@router.delete("/videos/{video_id}", status_code=204)
async def delete_video(video_id: int, db: DbConnection) -> None:
    deleted = await repo.delete_video_by_id(video_id=video_id, db=db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Video not found")
