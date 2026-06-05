import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.database import init_db
from src.douyin.router import router as douyin_router
from src.logging import setup_logging
from src.video.router import router as video_router

logger = logging.getLogger(__name__)
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("Application started")
    yield


# app
app = FastAPI(title="Viral Utils", lifespan=lifespan)

# routes
app.include_router(video_router)
app.include_router(douyin_router)
