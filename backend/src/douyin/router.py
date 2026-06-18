import logging
from collections.abc import AsyncGenerator

from fastapi import APIRouter
from fastapi.sse import EventSourceResponse

from src.database import DbConnection
from src.douyin import service
from src.douyin.schemas import UserCreate
from src.exceptions import AppException
from src.shared.schemas import EventStatus, SSEEvent
from src.tikhub.dependencies import TikHubClientDep

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
    except AppException as e:
        logger.error(e)
        yield SSEEvent(status=EventStatus.FAILED, message=e.message)
    except Exception as e:
        logger.exception(e)
        yield SSEEvent(status=EventStatus.FAILED, message="Unexpected error")


@router.get("/fetch_latest_videos")
async def fetch_latest_videos(
    db: DbConnection,
    tikhub: TikHubClientDep,
) -> AsyncGenerator[SSEEvent]:
    try:
        async for event in service.fetch_latest_videos(db=db, tikhub=tikhub):
            yield event
    except AppException as e:
        logger.error(e)
        yield SSEEvent(status=EventStatus.FAILED, message=e.message)
    except Exception as e:
        logger.exception(e)
        yield SSEEvent(status=EventStatus.FAILED, message="Unexpected error")


@router.get("/download_latest_videos")
async def download_latest_videos(db: DbConnection):
    try:
        async for event in service.download_latest_videos(db=db):
            yield event
    except AppException as e:
        logger.error(e)
        yield SSEEvent(status=EventStatus.FAILED, message=e.message)
    except Exception as e:
        logger.exception(e)
        yield SSEEvent(status=EventStatus.FAILED, message="Unexpected error")


@router.get("/fetch_and_download_latest_videos")
async def fetch_and_download_latest_videos(db: DbConnection, tikhub: TikHubClientDep):
    try:
        async for event in service.fetch_latest_videos(db=db, tikhub=tikhub):
            yield event
        async for event in service.download_latest_videos(db=db):
            yield event
    except AppException as e:
        logger.error(e)
        yield SSEEvent(status=EventStatus.FAILED, message=e.message)
    except Exception as e:
        logger.exception(e)
        yield SSEEvent(status=EventStatus.FAILED, message="Unexpected error")
