from fastapi import APIRouter, HTTPException, status

from src.database import DbConnection
from src.system import repository as repo
from src.system.schemas import SystemCreate, SystemResponse, SystemUpdate

router = APIRouter(prefix="/systems")


@router.get("/")
async def list_systems(db: DbConnection) -> list[SystemResponse]:
    systems = await repo.select_systems(db=db)
    return [SystemResponse.model_validate(s.model_dump()) for s in systems]


@router.get("/{system_id}")
async def get_system(system_id: int, db: DbConnection) -> SystemResponse:
    system = await repo.select_system_by_id(system_id=system_id, db=db)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    return SystemResponse.model_validate(system.model_dump())


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_system(system: SystemCreate, db: DbConnection) -> SystemResponse:
    created = await repo.insert_system(system=system, db=db)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create system")
    return SystemResponse.model_validate(created.model_dump())


@router.put("/{system_id}")
async def update_system(
    system_id: int,
    system: SystemUpdate,
    db: DbConnection,
) -> SystemResponse:
    updated = await repo.update_system_by_id(
        system_id=system_id,
        system=system,
        db=db,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="System not found")
    return SystemResponse.model_validate(updated.model_dump())


@router.delete("/{system_id}", status_code=204)
async def delete_system(system_id: int, db: DbConnection) -> None:
    deleted = await repo.delete_system_by_id(system_id=system_id, db=db)
    if not deleted:
        raise HTTPException(status_code=404, detail="System not found")
