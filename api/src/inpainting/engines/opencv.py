import cv2
import numpy as np

from src.inpainting.engine import InpaintEngineProtocol
from src.inpainting.schemas import InpaintConfig
from src.subtitle.schemas import BoundingBox


class OpenCV(InpaintEngineProtocol):
    def __init__(self, config: InpaintConfig) -> None:
        self._config = config

    def inpaint(self, frame: np.ndarray, bboxes: list[BoundingBox]) -> np.ndarray:
        # convert YUV420p to BGR for correct colour inpainting
        bgr = cv2.cvtColor(frame, cv2.COLOR_YUV2BGR_I420)

        h, w = bgr.shape[:2]

        for b in bboxes:
            expand = self._config.expand
            ex1 = max(0, b.x1 - expand)
            ey1 = max(0, b.y1 - expand)
            ex2 = min(w, b.x2 + expand)
            ey2 = min(h, b.y2 + expand)

            cx1 = max(b.x1, ex1)
            cy1 = max(b.y1, ey1)
            cx2 = min(b.x2, ex2)
            cy2 = min(b.y2, ey2)

            if cx2 <= cx1 or cy2 <= cy1:
                continue

            roi = bgr[ey1:ey2, ex1:ex2].copy()
            rh, rw = roi.shape[:2]

            sw = max(1, int(rw * self._config.scale))
            sh = max(1, int(rh * self._config.scale))
            scaled_roi = cv2.resize(roi, (sw, sh), interpolation=cv2.INTER_AREA)

            mask = np.zeros((sh, sw), dtype=np.uint8)
            mx1 = int((cx1 - ex1) * self._config.scale)
            my1 = int((cy1 - ey1) * self._config.scale)
            mx2 = int((cx2 - ex1) * self._config.scale)
            my2 = int((cy2 - ey1) * self._config.scale)
            mask[my1:my2, mx1:mx2] = 255

            inpainted = cv2.resize(
                cv2.inpaint(
                    scaled_roi,
                    mask,
                    inpaintRadius=self._config.radius,
                    flags=cv2.INPAINT_NS,
                ),
                (rw, rh),
                interpolation=cv2.INTER_CUBIC,
            )

            bx1 = cx1 - ex1
            by1 = cy1 - ey1
            bx2 = cx2 - ex1
            by2 = cy2 - ey1

            bgr[cy1:cy2, cx1:cx2] = inpainted[by1:by2, bx1:bx2]

        return cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV_I420)
