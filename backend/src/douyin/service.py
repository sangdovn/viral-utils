import asyncio
import json
import logging
from collections.abc import AsyncGenerator
from datetime import datetime

from aiosqlite import Connection
from fastapi.concurrency import run_in_threadpool

from src.common.schemas import EventStatus, SSEEvent
from src.douyin import repository as repo
from src.douyin.exceptions import (
    UpsertUserError,
    UserNotFoundError,
)
from src.douyin.schemas import (
    UserBase,
    UserResponse,
    UserUpdate,
    VideoCreate,
    VideoUpdate,
)
from src.tikhub.client import TikHubClient
from src.tikhub.exceptions import TikHubError, TikHubValidationError
from src.tikhub.schemas import AwemeItem, UserPostVideosResponse
from src.translation import service as translator

logger = logging.getLogger(__name__)


async def get_user_by_sec_uid(sec_uid: str, db: Connection) -> UserResponse:
    db_user = await repo.select_user_by_sec_uid(sec_uid=sec_uid, db=db)
    if not db_user:
        raise UserNotFoundError()
    return UserResponse.model_validate(db_user)


async def get_users(db: Connection) -> list[UserResponse]:
    db_users = await repo.select_users(db)
    return [UserResponse.model_validate(user) for user in db_users]


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


def _parse_user_videos_response(
    response: UserPostVideosResponse,
) -> tuple[str | None, list[dict]]:
    if not response.data.aweme_list:
        return None, []

    name = response.data.aweme_list[0].author.nickname

    videos = [
        {
            "aweme_id": v.aweme_id,
            "title": v.desc or v.caption,
            "create_time": v.create_time,
            "digg_count": v.statistics.digg_count,
            "duration": v.duration,
            "urls": json.dumps(_get_video_urls(video_data=v), ensure_ascii=False),
            "is_downloaded": False,
        }
        for v in response.data.aweme_list
    ]

    return name, videos


async def _translate_or_none(text: str | None) -> str | None:
    if not text:
        return None
    return await run_in_threadpool(translator.translate, text)


async def upsert_user_videos(
    user: UserBase,
    db: Connection,
    tikhub: TikHubClient,
) -> AsyncGenerator[SSEEvent]:
    logger.info("Start fetching user videos - sec_uid=%s", user.sec_uid)
    yield SSEEvent(
        status=EventStatus.STARTED,
        message="Start fetching user videos",
        progress=0,
    )

    # call TikHub api to get latest user videos
    for attempt in range(3):
        try:
            response = await tikhub.fetch_user_post_videos(sec_uid=user.sec_uid)
            break
        except TikHubValidationError:
            logger.error(
                "Schema validation failed for sec_uid=%s, stop retrying",
                user.sec_uid,
            )
            raise
        except TikHubError as e:
            if attempt == 2:
                logger.error(
                    "Failed to fetch user post videos - Retried %d times - %s",
                    attempt + 1,
                    e,
                )
                raise
            logger.warning(
                "Failed to fetch user videos - Retried %d times - Retrying...",
                attempt + 1,
            )
            await asyncio.sleep(2**attempt)  # 1s, 2s, 4s, 8s

    # parse TikHub response
    fetched_name, fetched_videos = _parse_user_videos_response(response=response)

    # update, translate user name & t_name
    if fetched_name:
        user.name = fetched_name
        user.t_name = await run_in_threadpool(translator.translate, fetched_name)

    # update last_fetched
    user.last_fetched = int(datetime.now().timestamp())

    # upsert user
    saved_user = await repo.upsert_user(user=user, db=db)
    if not saved_user:
        raise UpsertUserError()
    logger.info("Upserted user - %s", user.sec_uid)
    yield SSEEvent(
        status=EventStatus.PROCESSING,
        message="Upserted user",
    )

    # update, translate video title & t_title
    db_videos = await repo.select_videos_by_user_id(user_id=saved_user.id, db=db)
    db_videos_by_aweme_id = {video.aweme_id: video for video in db_videos}

    old_videos = []
    latest_videos = []
    for video in fetched_videos:
        aweme_id = video["aweme_id"]
        existing = db_videos_by_aweme_id.get(aweme_id)
        if existing is None:
            latest_videos.append(VideoCreate(**video, user_id=saved_user.id))
        else:
            updated = existing.model_copy(
                update={
                    "title": video["title"],
                    "digg_count": video["digg_count"],
                    "duration": video["duration"],
                    "urls": video["urls"],
                }
            )
            old_videos.append(VideoUpdate(**updated.model_dump()))

    latest_titles = [video.title for video in latest_videos]
    translated_latest_titles = await asyncio.gather(
        *[_translate_or_none(t) for t in latest_titles]
    )
    for video, t_title in zip(latest_videos, translated_latest_titles, strict=True):
        video.t_title = t_title

    # insert all new video into db
    merged_videos = old_videos + latest_videos
    total = len(merged_videos)
    succeed = 0
    for index, video in enumerate(merged_videos, start=1):
        try:
            await repo.upsert_video(video=video, db=db)
            succeed += 1
            logger.info("Upserted video - aweme_id=%s", video.aweme_id)
            yield SSEEvent(
                status=EventStatus.PROCESSING,
                message=f"Upserted {succeed}/{total} videos",
                progress=int((index / total) * 100),
            )
        except Exception as e:
            logger.error(
                "Failed to upsert video - aweme_id=%s - %s",
                video.aweme_id,
                e,
            )
            yield SSEEvent(status=EventStatus.FAILED, message="Failed to upsert video")
    yield SSEEvent(
        status=EventStatus.COMPLETED,
        message=f"Upserted user - {succeed}/{total} videos succeeded",
        progress=100,
    )


async def fetch_latest_videos(
    db: Connection, tikhub: TikHubClient
) -> AsyncGenerator[SSEEvent]:
    # filter active users
    active_users = await repo.select_active_users(db=db)
    logger.info("Active users: %d", len(active_users))
    for user in active_users[:1]:
        try:
            logger.info("hello")
            async for event in upsert_user_videos(
                user=UserUpdate(**user.model_dump()),
                db=db,
                tikhub=tikhub,
            ):
                yield event
                if event.status == EventStatus.FAILED:
                    logger.warning("Failed to fetch user - sec_uid=%s", user.sec_uid)
        except Exception:
            logger.exception("Failed to fetch latest videos - sec_uid=%s", user.sec_uid)
