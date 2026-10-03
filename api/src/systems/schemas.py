from enum import StrEnum
from typing import Annotated, Self

from pydantic import (
    UUID4,
    BaseModel,
    StringConstraints,
    field_validator,
    model_validator,
)

from src.schemas import ApiModel

SystemName = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=2, max_length=256)
]

SystemDescription = Annotated[str, StringConstraints(max_length=10_000)]


class System(BaseModel):
    id: UUID4
    name: SystemName
    description: SystemDescription | None = None
    created_at: int
    updated_at: int


class SystemCreate(ApiModel):
    name: SystemName
    description: SystemDescription | None = None


class SystemUpdate(ApiModel):
    name: SystemName | None = None
    description: SystemDescription | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("name cannot be null")
        return value

    @model_validator(mode="after")
    def require_change(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided")
        return self


class SystemResponse(BaseModel):
    id: UUID4
    name: SystemName
    description: SystemDescription | None = None


class SystemSortBy(StrEnum):
    ID = "id"
    NAME = "name"
    DESCRIPTION = "description"
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"


class SystemSortOrder(StrEnum):
    ASC = "asc"
    DESC = "desc"


class SystemsPageResponse(BaseModel):
    data: list[SystemResponse]
    total: int
    page_index: int
    page_size: int
