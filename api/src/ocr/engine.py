from typing import Protocol

import numpy as np

from src.subtitle.schemas import Subtitle
from src.video.engine import VideoMetadata


class OcrEngine(Protocol):
    def extract(self, frame: np.ndarray, meta: VideoMetadata) -> list[Subtitle]:
        """Detect text in a single frame and return a list of Subtitle."""
        ...
