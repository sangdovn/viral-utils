import logging
import threading
import time
from collections.abc import Generator
from pathlib import Path

from src.video.engine import VideoEngineProtocol

from src.inpainting.engine import InpaintEngineProtocol
from src.inpainting.schemas import InpaintConfig
from src.shared.schemas import EventStatus, SSEEvent
from src.subtitle.schemas import Subtitle

logger = logging.getLogger(__name__)


def inpaint(
    video_path: str | Path,
    out_path: str | Path,
    subtitles: list[Subtitle],
    video_engine: VideoEngineProtocol,
    engine: InpaintEngineProtocol,
    config: InpaintConfig,
    cancel: threading.Event | None = None,
) -> Generator[SSEEvent]:
    video_path = Path(video_path)
    out_path = Path(out_path)

    meta = video_engine.get_metadata(video_path)
    subtitles = [s for s in subtitles if s.conf >= config.conf_threshold]

    if not subtitles:
        video_engine.copy(video_path, out_path)
        yield SSEEvent(status=EventStatus.COMPLETED, message="No subtitles found")
        return

    encoder = video_engine.get_encoder(path=video_path, out_path=out_path)

    if encoder.stdin is None:
        raise BrokenPipeError("ffmpeg encoder failed to open stdin pipe")
    try:
        for frame in video_engine.iter_frames(video_path):
            if cancel and cancel.is_set():
                encoder.kill()
                yield SSEEvent(status=EventStatus.CANCELLED)
                return

            active = [s for s in subtitles if s.start <= frame.timestamp <= s.end]
            data = frame.data

            if active:
                data = engine.inpaint(frame.data, bboxes=[s.bbox for s in active])

            encoder.stdin.write(data.tobytes())

            yield SSEEvent(
                status=EventStatus.PROCESSING,
                message=f"Inpainting {frame.index}/{meta.total_frames} frames",
                progress=int((frame.index / meta.total_frames) * 100),
            )

            # Throttle to keep device cool
            time.sleep(config.delay)

    finally:
        if encoder.stdin:
            encoder.stdin.close()
        encoder.wait()
        if encoder.returncode != 0 and not (cancel and cancel.is_set()):
            err = (
                encoder.stderr.read().decode(errors="replace") if encoder.stderr else ""
            )
            raise RuntimeError(f"ffmpeg encode failed: {err}")

    yield SSEEvent(status=EventStatus.COMPLETED, message=str(out_path))
