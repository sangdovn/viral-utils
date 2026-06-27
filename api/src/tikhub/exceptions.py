from src.exceptions import AppException


class TikHubError(AppException):
    def __init__(self, message: str = "TikHub request failed"):
        super().__init__(message=message, status_code=502)


class TikHubStatusError(TikHubError):
    def __init__(
        self,
        message: str = "TikHub returned an error response",
        upstream_status_code: int | None = None,
    ):
        self.upstream_status_code = upstream_status_code
        super().__init__(message=message)


class TikHubRequestError(TikHubError):
    def __init__(self, message: str = "Failed to connect to TikHub"):
        super().__init__(message=message)


class TikHubValidationError(TikHubError):
    def __init__(self, message: str = "TikHub response did not match expected schema"):
        super().__init__(message=message)
