from enum import StrEnum

from pydantic import BaseModel


class EventStatus(StrEnum):
    STARTED = "started"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class SSEEvent(BaseModel):
    status: EventStatus
    message: str | None = None
    progress: int | None = None
