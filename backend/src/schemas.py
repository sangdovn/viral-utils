from enum import StrEnum

from pydantic import BaseModel


class EventStatus(StrEnum):
    PROGRESS = "progress"
    DONE = "done"
    CANCELLED = "cancelled"
    ERROR = "error"


class SSEEvent(BaseModel):
    status: EventStatus
    message: str | None = None
