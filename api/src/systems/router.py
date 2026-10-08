from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Response, status

from src.database import DB
from src.systems import repository as systems_repo
from src.systems.schemas import System, SystemCreate, SystemUpdate

router = APIRouter(prefix="/systems")


@router.post("")
async def create_system(
    db: DB,
    data: SystemCreate,
) -> System:
    return await systems_repo.create_system(db, data)


@router.get("/{system_id}")
async def get_system(db: DB, system_id: UUID) -> System:
    system = await systems_repo.get_system(db, system_id)
    if system is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System not found",
        )
    return system


@router.get("")
async def list_systems(
    db: DB,
    *,
    limit: Annotated[int, Query(le=100)] = 100,
    offset: int = 0,
) -> list[System]:
    return await systems_repo.list_systems(db, limit=limit, offset=offset)


@router.patch("/{system_id}")
async def update_system(
    db: DB,
    system_id: UUID,
    data: SystemUpdate,
) -> System:
    print("data", data)
    updated = await systems_repo.update_system(db, system_id, data)

    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System not found",
        )

    return updated


@router.delete("/{system_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_system(
    db: DB,
    system_id: UUID,
) -> Response:
    print("system_id", system_id)
    deleted = await systems_repo.delete_system(db, system_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System not found",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
