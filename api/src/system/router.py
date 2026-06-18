import logging

from fastapi import APIRouter, HTTPException

from src.database import DbConnection
from src.system import repository as repo
from src.system.schemas import SystemCreate, SystemResponse, SystemUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/systems")


@router.get("/")
async def list_systems(db: DbConnection) -> list[SystemResponse]:
    systems = await repo.select_systems(db=db)
    return [SystemResponse.model_validate(s) for s in systems]


@router.get("/{system_id}")
async def get_system(system_id: int, db: DbConnection) -> SystemResponse:
    system = await repo.select_system_by_id(system_id=system_id, db=db)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")

    return SystemResponse.model_validate(system)


@router.post("/")
async def create_system(system: SystemCreate, db: DbConnection) -> SystemResponse:
    try:
        created = await repo.insert_system(system=system, db=db)
        if not created:
            raise HTTPException(status_code=500, detail="Failed to create system")
    except Exception as e:
        logger.exception("Failed to create system - %e", e)

    return SystemResponse.model_validate(created)


@router.put("/{system_id}")
async def update_system(
    system_id: int, system: SystemUpdate, db: DbConnection
) -> SystemResponse:
    try:
        updated = await repo.update_system_by_id(
            system_id=system_id,
            system=system,
            db=db,
        )
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to update system")
    except Exception as e:
        logger.exception("Failed to update system - %e", e)

    return SystemResponse.model_validate(updated)


@router.delete("/{system_id}", status_code=204)
async def delete_system(system_id: int, db: DbConnection) -> None:
    try:
        deleted = await repo.delete_system_by_id(system_id=system_id, db=db)
        if not deleted:
            raise HTTPException(status_code=404, detail="System not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to delete system - %s", e)
        raise HTTPException(status_code=500, detail="Failed to delete system") from e
