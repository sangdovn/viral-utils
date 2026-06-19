from pydantic import BaseModel


class SystemBase(BaseModel):
    name: str
    description: str | None = None


class System(SystemBase):
    id: int
    created_at: int
    updated_at: int


class SystemCreate(SystemBase):
    pass


class SystemUpdate(SystemBase):
    pass


class SystemResponse(SystemBase):
    id: int
