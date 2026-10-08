from uuid import UUID, uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

from src.systems.schemas import System, SystemCreate, SystemUpdate
from src.utils.text import build_search_text


async def create_system(
    db: AsyncConnection,
    data: SystemCreate,
) -> System:
    system_id = uuid4()
    search_text = build_search_text(
        " ".join(filter(None, [data.name, data.description]))
    )

    result = await db.execute(
        text("""
            INSERT INTO systems (
                id,
                name,
                description,
                search_text
            )
            VALUES (
                :id,
                :name,
                :description,
                :search_text
            )
            RETURNING
                id,
                name,
                description,
                search_text,
                created_at,
                updated_at
         """),
        {
            "id": str(system_id),
            "name": data.name,
            "description": data.description,
            "search_text": search_text,
        },
    )

    return System.model_validate(result.mappings().one())


async def get_system(
    db: AsyncConnection,
    system_id: UUID,
) -> System | None:
    result = await db.execute(
        text("""
            SELECT
                id,
                name,
                description,
                search_text,
                created_at,
                updated_at
            FROM systems
            WHERE id = :id
             """),
        {
            "id": str(system_id),
        },
    )

    row = result.mappings().one_or_none()

    return System.model_validate(row) if row else None


async def list_systems(
    db: AsyncConnection,
    *,
    limit: int = 100,
    offset: int = 0,
) -> list[System]:
    result = await db.execute(
        text("""
            SELECT
                id,
                name,
                description,
                search_text,
                created_at,
                updated_at
            FROM systems
            ORDER BY created_at DESC
            LIMIT :limit
            OFFSET :offset
         """),
        {
            "limit": limit,
            "offset": offset,
        },
    )

    rows = result.mappings().all()

    return [System.model_validate(row) for row in rows]


async def update_system(
    db: AsyncConnection,
    system_id: UUID,
    data: SystemUpdate,
) -> System | None:
    search_text = build_search_text(
        " ".join(filter(None, [data.name, data.description]))
    )

    result = await db.execute(
        text(
            """
                UPDATE systems
                SET
                    name = :name,
                    description = :description,
                    search_text = :search_text
                WHERE
                    id = :id
                RETURNING
                    id,
                    name,
                    description,
                    search_text,
                    created_at,
                    updated_at
            """
        ),
        {
            "id": str(system_id),
            "name": data.name,
            "description": data.description,
            "search_text": search_text,
        },
    )

    row = result.mappings().one_or_none()

    return System.model_validate(row) if row else None


async def delete_system(
    db: AsyncConnection,
    system_id: UUID,
) -> bool:
    result = await db.execute(
        text(
            """
                DELETE FROM systems
                WHERE id = :id
            """
        ),
        {
            "id": str(system_id),
        },
    )

    return result.rowcount > 0
