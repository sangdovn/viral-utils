from pydantic import BaseModel


class System(BaseModel):
    id: int
    name: str
    description: str | None = None
    created_at: int
    updated_at: int


class SystemCreate(BaseModel):
    name: str
    description: str | None = None


class SystemUpdate(BaseModel):
    name: str
    description: str | None = None


class SystemResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
