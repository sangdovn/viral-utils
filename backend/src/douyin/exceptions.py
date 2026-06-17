from src.exceptions import AppException


class UserNotFoundError(AppException):
    def __init__(self, message: str = "User not found"):
        super().__init__(message, status_code=404)


class UserExistsError(AppException):
    def __init__(self, message: str = "User already exists"):
        super().__init__(message, status_code=409)


class InsertUserError(AppException):
    def __init__(self, message: str = "Failed to insert user"):
        super().__init__(message)


class FetchUserVideosError(AppException):
    def __init__(self, message: str = "Failed to fetch user videos"):
        super().__init__(message, status_code=502)
