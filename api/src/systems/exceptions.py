from fastapi import status

from src.exceptions import AppException


class SystemNotFound(AppException):
    def __init__(self, message: str = "System not found"):
        super().__init__(status.HTTP_404_NOT_FOUND, message)


class SystemAlreadyExists(AppException):
    def __init__(self, message: str = "System already exists"):
        super().__init__(status.HTTP_409_CONFLICT, message)
