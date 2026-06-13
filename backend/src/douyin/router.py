import logging
from collections.abc import AsyncGenerator

from aiosqlite import Connection
from fastapi import APIRouter, Depends
from fastapi.sse import EventSourceResponse

from src.common.schemas import EventStatus, SSEEvent
from src.database import get_db
from src.douyin import service
from src.douyin.exceptions import UpsertUserError
from src.douyin.schemas import CreateUserAndVideosRequest, UserCreate
from src.douyin.utils import extract_sec_uid
from src.tikhub.client import TikHubClient
from src.tikhub.dependencies import get_tikhub_client
from src.tikhub.exceptions import TikHubError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/douyin")


@router.post("/user", response_class=EventSourceResponse)
async def create_user_videos(
    request: CreateUserAndVideosRequest,
    db: Connection = Depends(get_db),
    tikhub: TikHubClient = Depends(get_tikhub_client),
) -> AsyncGenerator[SSEEvent]:
    sec_uid = extract_sec_uid(request.url)
    user = UserCreate(
        **request.model_dump(exclude={"url"}, exclude_none=True),
        sec_uid=sec_uid,
    )
    try:
        async for event in service.upsert_user_videos(user=user, db=db, tikhub=tikhub):
            yield event
    except TikHubError as e:
        logger.error(f"TikHub error: {e}")
        yield SSEEvent(status=EventStatus.FAILED, message="TikHub error")
    except UpsertUserError:
        logger.error("Upsert user error - %s", sec_uid)
        yield SSEEvent(status=EventStatus.FAILED, message="Upsert user failed")
    except Exception as e:
        logger.error("Unexpected error: %s", e)
        yield SSEEvent(status=EventStatus.FAILED, message="Unexpected error")


@router.get("/fetch_latest_videos")
async def fetch_latest_videos(
    db: Connection = Depends(get_db), tikhub: TikHubClient = Depends(get_tikhub_client)
):
    try:
        async for event in service.fetch_latest_videos(db=db, tikhub=tikhub):
            yield event
    except Exception as e:
        logger.error("Unexpected error - %s", e)
        yield SSEEvent(status=EventStatus.FAILED, message="Unexpected error")
