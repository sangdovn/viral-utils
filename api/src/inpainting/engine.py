from typing import Protocol

import numpy as np

from src.subtitle.schemas import BoundingBox


class InpaintEngineProtocol(Protocol):
    def inpaint(self, frame: np.ndarray, bboxes: list[BoundingBox]) -> np.ndarray:
        """Remove subtitles from a frame by inpainting the given bounding box regions."""
        ...
