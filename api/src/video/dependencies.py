from typing import Annotated

from fastapi import Depends, HTTPException

from src.inpainting.engine import InpaintEngineProtocol
from src.inpainting.engines.opencv import OpenCV
from src.inpainting.schemas import InpaintConfig, InpaintEngine
from src.ocr.engine import OcrEngine
from src.ocr.engines.ocrmac import Ocrmac
from src.ocr.engines.paddleocr import PaddleOcr
from src.ocr.schemas import OcrConfig
from src.subtitle.schemas import SubtitleConfig
from src.video.engine import VideoEngineProtocol
from src.video.engines.ffmpeg import FFmpeg
from src.video.schemas import ProcessVideosRequest, VideoConfig, VideoEngine


def get_video_engine(request: ProcessVideosRequest) -> VideoEngineProtocol:
    config = VideoConfig(
        codec=request.video_codec,
        quality=request.video_quality,
    )
    match request.video_engine:
        case VideoEngine.FFMPEG:
            return FFmpeg(config)
        case _:
            raise HTTPException(
                status_code=400, detail=f"Unknown video engine: {request.video_engine}"
            )


def get_ocr_engine(request: ProcessVideosRequest) -> OcrEngine:
    match request.ocr_engine:
        case "ocrmac":
            return Ocrmac()
        case "paddleocr":
            return PaddleOcr()
        case _:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown OCR engine: {request.ocr_engine}",
            )


def get_ocr_config(request: ProcessVideosRequest) -> OcrConfig:
    return OcrConfig(
        sample_interval=request.ocr_sample_interval,
        delay=request.ocr_delay,
        chinese_only=request.ocr_chinese_only,
    )


def get_subtitle_config(request: ProcessVideosRequest) -> SubtitleConfig:
    return SubtitleConfig(
        time_gap_tolerance=request.sub_time_gap_tolerance,
        text_similarity_threshold=request.sub_text_similarity_threshold,
        box_iou_threshold=request.sub_box_iou_threshold,
        frame_padding=request.sub_frame_padding,
    )


def get_inpaint_engine(request: ProcessVideosRequest) -> InpaintEngineProtocol:
    config = InpaintConfig(
        conf_threshold=request.inpaint_conf_threshold,
        scale=request.inpaint_scale,
        expand=request.inpaint_expand,
        radius=request.inpaint_radius,
        delay=request.inpaint_delay,
    )
    match request.inpaint_engine:
        case InpaintEngine.OPENCV:
            return OpenCV(config)
        # TODO: add lama
        case _:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown inpaint engine: {request.inpaint_engine}",
            )


def get_inpaint_config(request: ProcessVideosRequest) -> InpaintConfig:
    return InpaintConfig(
        conf_threshold=request.inpaint_conf_threshold,
        scale=request.inpaint_scale,
        expand=request.inpaint_expand,
        radius=request.inpaint_radius,
        delay=request.inpaint_delay,
    )


VideoEngineDep = Annotated[VideoEngineProtocol, Depends(get_video_engine)]
OcrEngineDep = Annotated[OcrEngine, Depends(get_ocr_engine)]
OcrConfigDep = Annotated[OcrConfig, Depends(get_ocr_config)]
SubtitleConfigDep = Annotated[SubtitleConfig, Depends(get_subtitle_config)]
InpaintEngineDep = Annotated[InpaintEngineProtocol, Depends(get_inpaint_engine)]
InpaintConfigDep = Annotated[InpaintConfig, Depends(get_inpaint_config)]
