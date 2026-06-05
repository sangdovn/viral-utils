class VideoEngineError(Exception):
    """Base for all engine errors — catch this to handle any engine failure."""


class DecodeError(VideoEngineError):
    """Raised when a video cannot be read or decoded."""


class EncodeError(VideoEngineError):
    """Raised when a frame cannot be written or the output cannot be finalised."""


class MetadataError(VideoEngineError):
    """Raised when metadata cannot be read or is malformed."""
