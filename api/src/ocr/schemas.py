from enum import StrEnum

from pydantic import BaseModel


class OcrEngine(StrEnum):
    OCRMAC = "ocrmac"
    PADDLE_OCR = "paddleocr"


class OcrConfig(BaseModel):
    sample_interval: int
    delay: float
    chinese_only: bool
