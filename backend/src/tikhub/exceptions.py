class TikHubError(Exception):
    pass


class TikHubValidationError(TikHubError):
    """Response received but didn't match expected schema."""

    pass
