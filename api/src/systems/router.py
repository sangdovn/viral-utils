import time
from typing import Annotated

from fastapi import APIRouter, Query, status
from pydantic import UUID4, StringConstraints
from sqlalchemy.exc import IntegrityError

from src.database import DbConnection
from src.systems import repository as system_repo
from src.systems.exceptions import SystemAlreadyExists, SystemNotFound
from src.systems.schemas import (
    System,
    SystemCreate,
    SystemResponse,
    SystemSortBy,
    SystemSortOrder,
    SystemsPageResponse,
    SystemUpdate,
)

router = APIRouter(prefix="/systems")


def _to_response(system: System) -> SystemResponse:
    return SystemResponse.model_validate(system, from_attributes=True)


def _is_name_conflict(error: IntegrityError) -> bool:
    return "systems.name" in str(error.orig)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_system(
    payload: SystemCreate,
    conn: DbConnection,
) -> SystemResponse:
    try:
        time.sleep(1)
        created = system_repo.create_system(payload, conn)
    except IntegrityError as e:
        if not _is_name_conflict(e):
            raise
        raise SystemAlreadyExists("System name already exists") from e
    return _to_response(created)


@router.get("/{system_id}", status_code=status.HTTP_200_OK)
def get_system(system_id: UUID4, conn: DbConnection) -> SystemResponse:
    system = system_repo.get_system(system_id, conn)
    if system is None:
        raise SystemNotFound()
    return _to_response(system)


@router.get("", status_code=status.HTTP_200_OK)
def list_systems(
    conn: DbConnection,
    page: Annotated[int, Query(ge=0)],
    limit: Annotated[int, Query(ge=1, le=100)],
    search: Annotated[
        str | None,
        Query(),
        StringConstraints(strip_whitespace=True),
    ] = None,
    sort_by: SystemSortBy = SystemSortBy.CREATED_AT,
    sort_order: SystemSortOrder = SystemSortOrder.DESC,
) -> SystemsPageResponse:
    systems, total = system_repo.list_systems(
        conn,
        limit=limit,
        offset=page * limit,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return SystemsPageResponse(
        data=[_to_response(s) for s in systems],
        total=total,
        page_index=page,
        page_size=limit,
    )


@router.patch("/{system_id}", status_code=status.HTTP_200_OK)
def update_system(
    system_id: UUID4, payload: SystemUpdate, conn: DbConnection
) -> SystemResponse:
    try:
        time.sleep(1)
        updated = system_repo.update_system(system_id, payload, conn)
    except IntegrityError as e:
        if not _is_name_conflict(e):
            raise
        raise SystemAlreadyExists("System name already exists") from e

    if updated is None:
        raise SystemNotFound()

    return _to_response(updated)


@router.delete("/{system_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_system(system_id: UUID4, conn: DbConnection) -> None:
    if not system_repo.delete_system(system_id, conn):
        raise SystemNotFound()
