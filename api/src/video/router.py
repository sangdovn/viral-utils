import logging
import shutil
import threading
from collections.abc import Generator

from fastapi import APIRouter, Depends
from fastapi.sse import EventSourceResponse

from src.config import settings
from src.inpainting.engine import InpaintEngineProtocol
from src.inpainting.schemas import InpaintConfig
from src.ocr.engine import OcrEngine
from src.ocr.schemas import OcrConfig
from src.shared.schemas import SSEEvent
from src.subtitle.schemas import SubtitleConfig
from src.video import service
from src.video.dependencies import (
    get_inpaint_config,
    get_inpaint_engine,
    get_ocr_config,
    get_ocr_engine,
    get_subtitle_config,
    get_video_engine,
)
from src.video.engine import VideoEngineProtocol
from src.video.schemas import ProcessVideosRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/video")

_cancel = threading.Event()


@router.post(path="/process/stream", response_class=EventSourceResponse)
def process_stream(
    request: ProcessVideosRequest,
    video_engine: VideoEngineProtocol = Depends(get_video_engine),
    ocr_engine: OcrEngine = Depends(get_ocr_engine),
    ocr_config: OcrConfig = Depends(get_ocr_config),
    subtitle_config: SubtitleConfig = Depends(get_subtitle_config),
    inpaint_engine: InpaintEngineProtocol = Depends(get_inpaint_engine),
    inpaint_config: InpaintConfig = Depends(get_inpaint_config),
) -> Generator[SSEEvent]:
    _cancel.clear()
    yield from service.process(
        request=request,
        video_engine=video_engine,
        ocr_engine=ocr_engine,
        ocr_config=ocr_config,
        subtitle_config=subtitle_config,
        inpaint_engine=inpaint_engine,
        inpaint_config=inpaint_config,
        llm_models=request.llm_models,
        cancel=_cancel,
    )


@router.post(path="/process/stream/test", response_class=EventSourceResponse)
def process_stream_test(
    request: ProcessVideosRequest,
    video_engine: VideoEngineProtocol = Depends(get_video_engine),
    ocr_engine: OcrEngine = Depends(get_ocr_engine),
    ocr_config: OcrConfig = Depends(get_ocr_config),
    subtitle_config: SubtitleConfig = Depends(get_subtitle_config),
    inpaint_engine: InpaintEngineProtocol = Depends(get_inpaint_engine),
    inpaint_config: InpaintConfig = Depends(get_inpaint_config),
) -> Generator[SSEEvent]:
    _cancel.clear()
    request.in_dir = request.in_dir + "/test"
    request.out_dir = request.out_dir + "/test"
    yield from service.process(
        request=request,
        video_engine=video_engine,
        ocr_engine=ocr_engine,
        ocr_config=ocr_config,
        subtitle_config=subtitle_config,
        inpaint_engine=inpaint_engine,
        inpaint_config=inpaint_config,
        llm_models=request.llm_models,
        cancel=_cancel,
    )


@router.delete("/process/stream")
def cancel_process_stream():
    _cancel.set()
    return {"status": "cancelled"}


@router.delete("/cache/clear")
def clear_cache_route():
    for p in settings.cache_dir.glob("*"):
        try:
            if p.is_dir():
                shutil.rmtree(p)
            elif p.is_file():
                p.unlink()
        except Exception as e:
            logger.error(e)

    return {"status": "done"}
