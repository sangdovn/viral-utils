from __future__ import annotations

from collections.abc import Generator
from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from subprocess import Popen
from typing import Protocol

import numpy as np


@dataclass(frozen=True)
class VideoMetadata:
    width: int
    height: int
    fps: float
    total_frames: int
    duration: float
    color_range: str
    color_space: str
    color_primaries: str
    color_transfer: str
    pix_fmt: PixelFormat


@dataclass(frozen=True)
class Frame:
    index: int
    timestamp: float
    data: np.ndarray


class ColorRange(StrEnum):
    TV = "tv"  # limited 16-235
    PC = "pc"  # full 0-255


class ColorSpace(StrEnum):
    BT709 = "bt709"
    SMPTE170M = "smpte170m"
    BT470BG = "bt470bg"


class ColorPrimaries(StrEnum):
    BT709 = "bt709"
    SMPTE170M = "smpte170m"
    BT470BG = "bt470bg"


class ColorTransfer(StrEnum):
    BT709 = "bt709"
    GAMMA22 = "gamma22"
    GAMMA28 = "gamma28"


class PixelFormat(StrEnum):
    YUV420P = "yuv420p"
    YUV422P = "yuv422p"
    YUV444P = "yuv444p"


@dataclass(frozen=True)
class ColorInfo:
    range: ColorRange
    space: ColorSpace
    primaries: ColorPrimaries
    transfer: ColorTransfer


class VideoEngineProtocol(Protocol):
    def get_metadata(self, path: str | Path) -> VideoMetadata: ...

    def iter_frames(self, path: str | Path) -> Generator[Frame]: ...

    def get_encoder(self, path: str | Path, out_path: str | Path) -> Popen: ...

    def copy(self, src: str | Path, dst: str | Path) -> None: ...
