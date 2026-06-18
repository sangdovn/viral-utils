import logging

import numpy as np

from src.ocr.engine import OcrEngine
from src.subtitle.schemas import BoundingBox, Subtitle
from src.video.engine import VideoMetadata

logger = logging.getLogger(__name__)


class PaddleOcr(OcrEngine):
    def __init__(self):
        from paddleocr import PaddleOCR

        self._engine = PaddleOCR(
            text_detection_model_name="PP-OCRv5_mobile_det",
            text_recognition_model_name="PP-OCRv5_mobile_rec",
            use_doc_orientation_classify=False,  # no detect page rotation
            use_doc_unwarping=False,  # no straighten curved pages
            use_textline_orientation=False,  # no detect text line angles
        )
        logger.debug("Using paddleocr")

    def extract(self, frame: np.ndarray, meta: VideoMetadata) -> list[Subtitle]:
        import cv2

        gray = frame[: meta.height]
        rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
        result = self._engine.predict(rgb)
        boxes = []

        if not result:
            return boxes

        for res in result:
            for text, confidence, (x1, y1, x2, y2) in zip(
                res["rec_texts"],
                res["rec_scores"],
                res["rec_boxes"],
                strict=False,
            ):
                if not text.strip():
                    continue

                boxes.append(
                    Subtitle(
                        text=text,
                        bbox=BoundingBox(
                            x1=int(x1),
                            y1=int(y1),
                            x2=int(x2),
                            y2=int(y2),
                        ),
                        conf=float(confidence),
                        start=0.0,
                        end=0.0,
                    )
                )

        return boxes
