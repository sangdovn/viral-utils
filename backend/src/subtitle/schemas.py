from pydantic import BaseModel


class BoundingBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int


class Subtitle(BaseModel):
    text: str
    conf: float
    bbox: BoundingBox
    start: float
    end: float


class SubtitleConfig(BaseModel):
    time_gap_tolerance: float
    text_similarity_threshold: float
    box_iou_threshold: float
    frame_padding: int
