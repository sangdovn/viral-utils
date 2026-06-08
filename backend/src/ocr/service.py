import json
import logging
import threading
import time
from collections.abc import Generator
from pathlib import Path

from src.config import get_settings
from src.ocr.engine import OcrEngine
from src.ocr.schemas import OcrConfig
from src.shared.schemas import EventStatus, SSEEvent
from src.subtitle.schemas import Subtitle
from src.video.engine import VideoEngineProtocol

logger = logging.getLogger(__name__)


def _is_chinese(text: str) -> bool:
    return any("\u4e00" <= ch <= "\u9fff" for ch in text)


def extract(
    video_path: str | Path,
    video_engine: VideoEngineProtocol,
    engine: OcrEngine,
    config: OcrConfig,
    cancel: threading.Event | None = None,
) -> Generator[SSEEvent, None, list[Subtitle]]:
    video_path = Path(video_path)
    subs: list[Subtitle] = []

    # load cache
    cache = get_settings().cache_dir / video_path.stem / "ocr.json"
    if cache.exists():
        data = cache.read_text(encoding="utf-8")
        logger.debug("Loaded OCRed subtitles from cache")
        yield SSEEvent(status=EventStatus.DONE)
        return [Subtitle(**s) for s in json.loads(data)]

    # If not cache run ocr with sampling interval
    meta = video_engine.get_metadata(video_path)
    frames = video_engine.iter_frames(video_path)
    scanned = 0
    for f in frames:
        if cancel and cancel.is_set():
            yield SSEEvent(status=EventStatus.CANCELLED)
            return []

        if f.index % config.sample_interval != 0:
            continue

        # NOTE: Throttle for low-end devices
        # Could removable for cloud GPU
        time.sleep(config.delay)

        results = engine.extract(frame=f.data, meta=meta)
        for r in results:
            if config.chinese_only and not _is_chinese(r.text):
                continue

            subs.append(
                Subtitle(
                    text=r.text,
                    conf=r.conf,
                    bbox=r.bbox,
                    start=f.timestamp,
                    end=f.timestamp,
                )
            )
        scanned += 1

        yield SSEEvent(
            status=EventStatus.PROGRESS,
            message=f"OCR: {f.index}/{meta.total_frames} frames",
        )

    logger.debug("OCRed %s frames", scanned)

    # Save cache
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(
        data=json.dumps([s.model_dump() for s in subs], ensure_ascii=False),
        encoding="utf-8",
    )
    # yield SSEEvent(status=EventStatus.DONE, message=video_path.name)
    logger.debug("Saved OCRed subtitles cache")
    return subs
