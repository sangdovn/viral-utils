import logging
from collections.abc import AsyncGenerator

from fastapi import APIRouter
from fastapi.sse import EventSourceResponse

from src.common.schemas import EventStatus, SSEEvent
from src.database import DbConnection
from src.douyin import service
from src.douyin.exceptions import FetchUserVideosError, InsertUserError, UserExistsError
from src.douyin.schemas import UserCreate
from src.tikhub.dependencies import TikHubClientDep
from src.tikhub.exceptions import TikHubError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/douyin")


@router.post("/user", response_class=EventSourceResponse)
async def create_user_videos(
    request: UserCreate,
    db: DbConnection,
    tikhub: TikHubClientDep,
) -> AsyncGenerator[SSEEvent]:
    try:
        async for event in service.create_user_videos(
            user=UserCreate(**request.model_dump()),
            db=db,
            tikhub=tikhub,
        ):
            yield event
        return
    except TikHubError as e:
        logger.error("TikHub error - %s - sec_uid=%s", e, request.sec_uid)
    except FetchUserVideosError as e:
        logger.error("Fetch error - %s - sec_uid=%s", e, request.sec_uid)
    except (InsertUserError, UserExistsError) as e:
        logger.error("Database error - %s - sec_uid=%s", e, request.sec_uid)
    except Exception as e:
        logger.error("Unexpected error - %s - sec_uid=%s", e, request.sec_uid)
    yield SSEEvent(status=EventStatus.FAILED, message="Failed to create user videos")


@router.get("/fetch_latest_videos")
async def fetch_latest_videos(
    db: DbConnection,
    tikhub: TikHubClientDep,
) -> AsyncGenerator[SSEEvent]:
    try:
        async for event in service.fetch_latest_videos(db=db, tikhub=tikhub):
            yield event
        return
    except Exception as e:
        logger.error("Unexpected error - %s", e)
    yield SSEEvent(status=EventStatus.FAILED, message="Failed to fetch latest videos")


@router.get("/download_latest_videos")
async def download_latest_videos(db: DbConnection):
    try:
        # TODO: add fetch latest video here
        async for event in service.download_latest_videos(db=db):
            yield event
        return
    except Exception as e:
        logger.error("Unexpected error - %s", e)
    yield SSEEvent(
        status=EventStatus.FAILED,
        message="Failed to download latest videos",
    )
