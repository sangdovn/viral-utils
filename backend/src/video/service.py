import logging
import threading
from collections.abc import Generator
from pathlib import Path

from src.inpainting import service as inpaint_service
from src.inpainting.engine import InpaintEngineProtocol
from src.inpainting.schemas import InpaintConfig
from src.llm.schemas import LLMModel
from src.ocr import service as ocr_service
from src.ocr.engine import OcrEngine
from src.ocr.schemas import OcrConfig
from src.shared.schemas import EventStatus, SSEEvent
from src.subtitle import service as subtitle_service
from src.subtitle.schemas import Subtitle, SubtitleConfig
from src.video.constants import ALLOWED_EXTENSIONS
from src.video.engine import VideoEngineProtocol
from src.video.schemas import ProcessVideosRequest

logger = logging.getLogger(__name__)


def process(
    request: ProcessVideosRequest,
    video_engine: VideoEngineProtocol,
    ocr_engine: OcrEngine,
    ocr_config: OcrConfig,
    subtitle_config: SubtitleConfig,
    inpaint_engine: InpaintEngineProtocol,
    inpaint_config: InpaintConfig,
    llm_models: list[LLMModel],
    cancel: threading.Event | None = None,
) -> Generator[SSEEvent]:
    in_dir = Path(request.in_dir)
    out_dir = Path(request.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    files = [f for f in in_dir.glob("*") if f.suffix in ALLOWED_EXTENSIONS]

    for f in files:
        logger.info("Start processing video - file=%s", str(f.name))

        # --- OCR ---
        ocr_subs: list[Subtitle] = []
        ocr_generator = ocr_service.extract(
            video_path=f,
            video_engine=video_engine,
            engine=ocr_engine,
            config=ocr_config,
            cancel=cancel,
        )
        try:
            while True:
                event = next(ocr_generator)
                yield event
                if event.status == EventStatus.CANCELLED:
                    return
        except StopIteration as e:
            ocr_subs = e.value
        logger.info("Completed OCR")

        if not ocr_subs:
            logger.warning("No subtitles found")
            yield SSEEvent(status=EventStatus.DONE, message=str(f.name))
            continue

        # --- Merge subtitles ---
        yield SSEEvent(status=EventStatus.PROGRESS, message="Merge subtitles")
        merged_subs = subtitle_service.merge(
            video_path=f,
            video_engine=video_engine,
            subtitles=ocr_subs,
            subtitle_config=subtitle_config,
        )
        logger.info("Merged subtitles")

        # --- Translate merged subtitles ---
        srt_path = out_dir / f"{f.stem}.srt"
        yield SSEEvent(status=EventStatus.PROGRESS, message="Translate subtitles")
        translated_subs = subtitle_service.translate(
            video_path=f,
            subtitles=merged_subs,
            llm_models=llm_models,
        )
        subtitle_service.write_srt(subtitles=translated_subs, srt_path=srt_path)

        # --- Inpaint ---
        for event in inpaint_service.inpaint(
            video_path=f,
            out_path=out_dir / f.name,
            video_engine=video_engine,
            engine=inpaint_engine,
            subtitles=translated_subs,
            config=inpaint_config,
            cancel=cancel,
        ):
            yield event
            if event.status == EventStatus.CANCELLED:
                return

        # --- Move video to trash after process ---
        yield SSEEvent(status=EventStatus.PROGRESS, message="Delete original video")

    yield SSEEvent(status=EventStatus.DONE, message=str(f))
    logger.info("Completed processing all videos")
