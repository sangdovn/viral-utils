from enum import StrEnum

from pydantic import BaseModel


class InpaintEngine(StrEnum):
    OPENCV = "opencv"
    LAMA = "lama"


class InpaintConfig(BaseModel):
    conf_threshold: float
    scale: float
    expand: int
    radius: int
    delay: float
