import logging

from fastapi import APIRouter, HTTPException

from src.database import DbConnection
from src.platform import repository as repo
from src.platform.schemas import PlatformCreate, PlatformResponse, PlatformUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/platforms")


@router.get("/")
async def list_platforms(db: DbConnection) -> list[PlatformResponse]:
    platforms = await repo.select_platforms(db=db)
    return [PlatformResponse.model_validate(s) for s in platforms]


@router.get("/{platform_id}")
async def get_platform(platform_id: int, db: DbConnection) -> PlatformResponse:
    platform = await repo.select_platform_by_id(platform_id=platform_id, db=db)
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")

    return PlatformResponse.model_validate(platform)


@router.post("/")
async def create_platform(
    platform: PlatformCreate, db: DbConnection
) -> PlatformResponse:
    try:
        created = await repo.insert_platform(platform=platform, db=db)
        if not created:
            raise HTTPException(status_code=500, detail="Failed to create platform")
    except Exception as e:
        logger.exception("Failed to create platform - %e", e)

    return PlatformResponse.model_validate(created)


@router.put("/{platform_id}")
async def update_platform(
    platform_id: int, platform: PlatformUpdate, db: DbConnection
) -> PlatformResponse:
    try:
        updated = await repo.update_platform_by_id(
            platform_id=platform_id,
            platform=platform,
            db=db,
        )
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to update platform")
    except Exception as e:
        logger.exception("Failed to update platform - %e", e)

    return PlatformResponse.model_validate(updated)


@router.delete("/{platform_id}", status_code=204)
async def delete_platform(platform_id: int, db: DbConnection) -> None:
    try:
        deleted = await repo.delete_platform_by_id(platform_id=platform_id, db=db)
        if not deleted:
            raise HTTPException(status_code=404, detail="Platform not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to delete platform - %s", e)
        raise HTTPException(status_code=500, detail="Failed to delete platform") from e
