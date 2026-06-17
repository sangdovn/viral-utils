import asyncio
import json
import logging
from collections.abc import AsyncGenerator
from datetime import datetime
from pathlib import Path
from typing import Any

from aiosqlite import Connection
from fastapi.concurrency import run_in_threadpool

from src.common.schemas import EventStatus, SSEEvent
from src.douyin import repository as repo
from src.douyin.exceptions import (
    FetchUserVideosError,
    InsertUserError,
    UserExistsError,
    UserNotFoundError,
)
from src.douyin.schemas import (
    User,
    UserCreate,
    UserResponse,
    UserUpdate,
    Video,
    VideoCreate,
    VideoUpdate,
)
from src.download import service as download_service
from src.tikhub.client import TikHubClient
from src.tikhub.exceptions import TikHubError
from src.tikhub.schemas import AwemeItem
from src.translation import service as translate_service

logger = logging.getLogger(__name__)

# ==============================================================================
# CRUD
# ==============================================================================


async def get_user_by_sec_uid(sec_uid: str, db: Connection) -> UserResponse:
    db_user = await repo.select_user_by_sec_uid(sec_uid=sec_uid, db=db)
    if not db_user:
        raise UserNotFoundError()
    return UserResponse.model_validate(db_user)


async def get_users(db: Connection) -> list[UserResponse]:
    db_users = await repo.select_users(db)
    return [UserResponse.model_validate(user) for user in db_users]


# ==============================================================================
# HELPERS
# ==============================================================================


def _get_video_urls(video_data: AwemeItem) -> list[str]:
    video = video_data.video
    if video.play_addr_265:
        urls = video.play_addr_265.url_list
    elif video.play_addr_h264:
        urls = video.play_addr_h264.url_list
    elif video.play_addr:
        urls = video.play_addr.url_list
    elif video.download_addr:
        urls = video.download_addr.url_list
    else:
        urls = []
    return urls


async def _translate_text(text: str | None) -> str | None:
    if not text:
        return None
    try:
        return await run_in_threadpool(translate_service.translate, text)
    except Exception:
        logger.warning("Translation failed, using original - text=%s", text)
        return text


async def _translate_video_titles(
    videos: list[dict[str, Any]],
) -> list[str | None]:
    return list(
        await asyncio.gather(*[_translate_text(video["title"]) for video in videos])
    )


# ==============================================================================
# CORE
# ==============================================================================


async def _insert_user(
    user: UserCreate,
    fetched_user: dict,
    db: Connection,
) -> User:
    name = fetched_user["name"]
    t_name = await _translate_text(name)
    saved = await repo.insert_user(
        user=user.model_copy(
            update={
                "name": name,
                "t_name": t_name,
                "last_fetched": int(datetime.now().timestamp()),
            }
        ),
        db=db,
    )
    if not saved:
        raise InsertUserError()
    return saved


async def _insert_videos(
    videos: list[dict[str, Any]],
    translated_titles: list[str | None],
    user_id: int,
    db: Connection,
) -> AsyncGenerator[SSEEvent]:
    total = len(videos)
    for i, (video, t_title) in enumerate(
        zip(videos, translated_titles, strict=True), start=1
    ):
        try:
            await repo.upsert_video(
                video=VideoCreate(
                    **video,
                    t_title=t_title,
                    user_id=user_id,
                ),
                db=db,
            )
        except Exception as e:
            logger.error(
                "Failed to upsert video - aweme_id=%s - %s", video["aweme_id"], e
            )
            yield SSEEvent(
                status=EventStatus.FAILED,
                message=f"Failed to save video {i}/{total}",
            )
            continue
        yield SSEEvent(
            status=EventStatus.PROCESSING,
            message=f"Saved {i}/{total} videos",
            progress=40 + int((i / total) * 60),
        )


async def fetch_user_latest_videos(
    sec_uid: str,
    tikhub: TikHubClient,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    for attempt in range(3):
        try:
            response = await tikhub.fetch_user_post_videos(sec_uid=sec_uid)
            break
        except TikHubError as e:
            logger.error(
                "Failed to fetch user lastest videos - retries=%d - %s",
                attempt,
                e,
            )
            continue
        except Exception as e:
            logger.error("Unknown error: %s", e)
            raise

    if not response or not response.data or not response.data.aweme_list:
        return {}, []

    aweme_items = response.data.aweme_list
    name = aweme_items[0].author.nickname
    user = {"sec_uid": sec_uid, "name": name}
    aweme_items = [
        {
            "aweme_id": item.aweme_id,
            "title": item.desc or item.caption,
            "create_time": item.create_time,
            "digg_count": item.statistics.digg_count,
            "duration": item.duration,
            "urls": json.dumps(_get_video_urls(video_data=item), ensure_ascii=False),
            "is_downloaded": False,
        }
        for item in response.data.aweme_list
    ]

    return user, aweme_items


async def create_user_videos(
    user: UserCreate,
    db: Connection,
    tikhub: TikHubClient,
) -> AsyncGenerator[SSEEvent]:
    yield SSEEvent(status=EventStatus.STARTED, message="Fetching user", progress=0)

    fetched_user, fetched_videos = await fetch_user_latest_videos(
        sec_uid=user.sec_uid,
        tikhub=tikhub,
    )
    if not fetched_user:
        raise FetchUserVideosError()

    existing = await repo.select_user_by_sec_uid(sec_uid=user.sec_uid, db=db)
    if existing:
        raise UserExistsError()

    yield SSEEvent(status=EventStatus.PROCESSING, message="Saving user", progress=20)
    saved = await _insert_user(user=user, fetched_user=fetched_user, db=db)

    yield SSEEvent(
        status=EventStatus.PROCESSING, message="Translating videos", progress=30
    )
    translated_titles = await _translate_video_titles(fetched_videos)

    yield SSEEvent(status=EventStatus.PROCESSING, message="Saving videos", progress=40)
    async for event in _insert_videos(
        videos=fetched_videos,
        translated_titles=translated_titles,
        user_id=saved.id,
        db=db,
    ):
        yield event

    yield SSEEvent(
        status=EventStatus.COMPLETED,
        message="Done",
        progress=100,
        data=UserResponse.model_validate(saved.model_dump()).model_dump(),
    )


async def _sync_user(
    existing: User,
    fetched_user: dict,
    db: Connection,
) -> User:
    name = fetched_user["name"]
    if not name or name == existing.name:
        return existing

    t_name = await _translate_text(name)
    updated = await repo.update_user_by_id(
        user_id=existing.id,
        user=UserUpdate(
            name=name,
            t_name=t_name,
            last_fetched=int(datetime.now().timestamp()),
        ),
        db=db,
    )
    return updated or existing


async def _sync_user_videos(
    existing_user: User,
    fetched_videos: list[dict[str, Any]],
    db: Connection,
) -> None:
    db_videos = await repo.select_videos_by_user_id(user_id=existing_user.id, db=db)
    db_videos_by_aweme_id = {v.aweme_id: v for v in db_videos}

    new_videos = []
    update_videos = []

    for video in fetched_videos:
        existing = db_videos_by_aweme_id.get(video["aweme_id"])
        if not existing:
            new_videos.append(video)
        else:
            update_videos.append((existing, video))

    # translate new videos in batch
    translated_titles = await _translate_video_titles(new_videos)

    for video, t_title in zip(new_videos, translated_titles, strict=True):
        try:
            await repo.insert_video(
                video=VideoCreate(
                    **video,
                    t_title=t_title,
                    user_id=existing_user.id,
                ),
                db=db,
            )
        except Exception as e:
            logger.error(
                "Failed to insert video - aweme_id=%s - %s",
                video["aweme_id"],
                e,
            )

    for existing_video, video in update_videos:
        title = video["title"]
        t_title = existing_video.t_title
        if title and title != existing_video.title:
            t_title = await _translate_text(title)
        try:
            await repo.update_video_by_id(
                video_id=existing_video.id,
                video=VideoUpdate(
                    title=title,
                    t_title=t_title,
                    digg_count=video["digg_count"],
                    duration=video["duration"],
                    urls=video["urls"],
                    is_downloaded=video["is_downloaded"],
                ),
                db=db,
            )
        except Exception as e:
            logger.error(
                "Failed to update video - aweme_id=%s - %s", video["aweme_id"], e
            )


async def fetch_latest_videos(
    db: Connection,
    tikhub: TikHubClient,
) -> AsyncGenerator[SSEEvent]:
    active_users = await repo.select_active_users(db=db)
    total = len(active_users)

    yield SSEEvent(
        status=EventStatus.STARTED, message="Fetching latest videos", progress=0
    )

    results = await asyncio.gather(
        *[
            fetch_user_latest_videos(sec_uid=u.sec_uid, tikhub=tikhub)
            for u in active_users
        ]
    )

    for i, (user, (fetched_user, fetched_videos)) in enumerate(
        zip(active_users, results, strict=True), start=1
    ):
        if not fetched_user:
            logger.warning("Skip - failed to fetch - sec_uid=%s", user.sec_uid)
            continue

        yield SSEEvent(
            status=EventStatus.PROCESSING,
            message=f"Syncing user {i}/{total}",
            progress=int((i / total) * 100),
        )

        existing = await repo.select_user_by_sec_uid(sec_uid=user.sec_uid, db=db)
        if not existing:
            logger.warning("Skip - user not found - sec_uid=%s", user.sec_uid)
            continue

        await _sync_user(existing=existing, fetched_user=fetched_user, db=db)
        await _sync_user_videos(
            existing_user=existing,
            fetched_videos=fetched_videos,
            db=db,
        )

    yield SSEEvent(status=EventStatus.COMPLETED, message="Done", progress=100)


# TODO: review code & log/event message
# TODO: update download name, restrict the length of file name
#   : remove hastag
#     name = f"{video.create_time[:8]}-{video.digg_count}-{video.video_id}-{title}"
#     name = f"{name[: config.filename_max_len]}.mp4"
#     path = f"{dir.rstrip('/')}/{name}"
async def download_video(video: Video) -> tuple[Video, bool]:
    if not video.urls:
        logger.warning("No URLs found for video - aweme_id=%s", video.aweme_id)
        return video, False

    path = Path(f"/Users/sang/Desktop/test/{video.t_title}.mp4")
    if path.exists():
        logger.warning("Video already exists - path=%s", str(path))
        return video, True

    path.parent.mkdir(parents=True, exist_ok=True)
    for url in json.loads(video.urls):
        for attempt in range(3):
            try:
                download_ok = await asyncio.to_thread(
                    download_service.download, url, path
                )
                if download_ok:
                    return video, True
            except Exception as e:
                logger.error(
                    "Exception during download"
                    " - attempt=%d - url=%s - path=%s - error=%s",
                    attempt + 1,
                    url,
                    str(path),
                    str(e),
                )
            logger.error(
                "Failed to download video - retry=%d - url=%s - path=%s",
                attempt + 1,
                url,
                str(path),
            )
    return video, False


# TODO: review code & log/event message
async def download_latest_videos(db: Connection) -> AsyncGenerator[SSEEvent]:
    yield SSEEvent(
        status=EventStatus.STARTED,
        message="Downloading latest videos",
        progress=0,
    )

    available_videos = await repo.select_available_videos(db=db)
    if not available_videos:
        yield SSEEvent(
            status=EventStatus.COMPLETED,
            message="No videos to download",
            progress=100,
        )
        return

    total = len(available_videos)
    completed = 0

    tasks = [
        asyncio.create_task(download_video(v), name=f"download-{v.aweme_id}")
        for v in available_videos
    ]

    for coro in asyncio.as_completed(tasks):
        video, result = await coro

        completed += 1
        progress = int((completed / total) * 100)

        saved_video = await repo.update_video_by_id(
            video_id=video.id,
            video=VideoUpdate(is_downloaded=result),
            db=db,
        )
        if saved_video:
            logger.debug(
                "Updated video download status - aweme_id=%s", saved_video.aweme_id
            )

        yield SSEEvent(
            status=EventStatus.COMPLETED if result else EventStatus.FAILED,
            message=f"{'Downloaded' if result else 'Failed'}: {video.aweme_id}",
            progress=progress,
        )

    yield SSEEvent(
        status=EventStatus.COMPLETED,
        message=f"Done - {completed}/{total} videos are downloaded",
        progress=100,
    )
