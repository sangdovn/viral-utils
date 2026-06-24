import logging

from fastapi import APIRouter, HTTPException

from src.database import DbConnection
from src.platform import repository as repo
from src.platform.schemas import (
    PlatformCreate,
    PlatformResponse,
    PlatformStatus,
    PlatformType,
    PlatformUpdate,
)
from src.system import repository as system_repo

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/platforms")


@router.get("/")
async def list_platforms(db: DbConnection) -> list[PlatformResponse]:
    platforms = await repo.select_platforms(db=db)
    systems = await system_repo.select_systems(db=db)
    systems_by_id = {s.id: s for s in systems}

    return [
        PlatformResponse(
            **p.model_dump(exclude={"system_id"}),
            system=systems_by_id.get(p.system_id) if p.system_id else None,
        )
        for p in platforms
    ]


@router.post("/")
async def create_platform(
    platform: PlatformCreate, db: DbConnection
) -> PlatformResponse:
    try:
        system = None
        if platform.system_id is not None:
            system = await system_repo.select_system_by_id(
                system_id=platform.system_id,
                db=db,
            )
            if not system:
                raise HTTPException(status_code=404, detail="System not found")

        created = await repo.insert_platform(platform=platform, db=db)
        if not created:
            raise HTTPException(status_code=500, detail="Failed to create platform")
        return PlatformResponse(
            **created.model_dump(),
            system=system,
        )
    except Exception as e:
        logger.exception(e)
        raise


@router.get("/types")
async def list_types():
    return list(PlatformType)


@router.get("/statuses")
async def list_statuses():
    return list(PlatformStatus)


@router.get("/{platform_id}")
async def get_platform(platform_id: int, db: DbConnection) -> PlatformResponse:
    try:
        platform = await repo.select_platform_by_id(platform_id=platform_id, db=db)
        if not platform:
            raise HTTPException(status_code=404, detail="Platform not found")
        return PlatformResponse.model_validate(platform.model_dump())
    except Exception as e:
        logger.exception(e)
        raise


@router.put("/{platform_id}")
async def update_platform(
    platform_id: int, platform: PlatformUpdate, db: DbConnection
) -> PlatformResponse:
    try:
        systems = await system_repo.select_systems(db=db)
        system_by_id = {s.id: s for s in systems}
        updated = await repo.update_platform_by_id(
            platform_id=platform_id,
            platform=platform,
            db=db,
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Platform not found")
        return PlatformResponse(
            **updated.model_dump(),
            system=system_by_id.get(updated.system_id) if updated.system_id else None,
        )
    except Exception as e:
        logger.exception(e)
        raise


@router.delete("/{platform_id}", status_code=204)
async def delete_platform(platform_id: int, db: DbConnection) -> None:
    try:
        deleted = await repo.delete_platform_by_id(platform_id=platform_id, db=db)
        if not deleted:
            raise HTTPException(status_code=404, detail="Platform not found")
    except Exception as e:
        logger.exception(e)
        raise
