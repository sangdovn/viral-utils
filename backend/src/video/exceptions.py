from src.exceptions import AppException


class DecodeError(AppException):
    """Raised when a video cannot be read or decoded."""


class EncodeError(AppException):
    """Raised when a frame cannot be written or the output cannot be finalised."""


class MetadataError(AppException):
    """Raised when metadata cannot be read or is malformed."""
