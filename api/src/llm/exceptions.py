from src.exceptions import AppException


class LLMError(AppException):
    """Base for all LLM errors."""


class RateLimitError(AppException):
    """Provider is rate-limited - try next, maybe retry later."""


class AuthError(AppException):
    """Bad or missing API key - no point retrying this provider."""


class EmptyResponseError(AppException):
    """Provider returned a result but content was None/empty."""


class LLMAllModelsFailedError(AppException):
    """All rotation models are failed to complete."""

    def __init__(self, message: str = "All LLM models failed"):
        super().__init__(message, status_code=502)


def normalize_error(e: Exception) -> AppException:
    """Map provider-specific exceptions to our own error types."""
    code = getattr(e, "status_code", None) or getattr(e, "code", None)
    msg = str(e)

    if code in (429,) or "rate limit" in msg.lower():
        error = RateLimitError(msg)
    elif code in (401, 403) or "api key" in msg.lower():
        error = AuthError(msg)
    else:
        error = LLMError(msg)

    error.__cause__ = e  # manually attach the chain
    return error
