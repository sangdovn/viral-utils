class DouyinException(Exception): ...


# ==============================================================================
# USER
# ==============================================================================
class UpsertUserError(DouyinException): ...


class UserNotFoundError(DouyinException): ...


class UserExistsError(DouyinException):
    def __init__(self, message: str = "User already exists"):
        super().__init__(message)


class InsertUserError(DouyinException):
    def __init__(self, message: str = "Failed to insert user"):
        super().__init__(message)


# ==============================================================================
# VIDEO
# ==============================================================================


class FetchUserVideosError(DouyinException): ...


class UpsertVideoError(DouyinException): ...
