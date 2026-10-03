from uuid import UUID

from sqlalchemy import Connection, RowMapping, delete, func, insert, select, update

from src.metadata import systems
from src.systems.schemas import (
    System,
    SystemCreate,
    SystemSortBy,
    SystemSortOrder,
    SystemUpdate,
)
from src.utils.text import normalize_search


def _to_dto(row: RowMapping) -> System:
    return System.model_validate(row)


def create_system(data: SystemCreate, conn: Connection) -> System:
    values = data.model_dump()
    values["search_text"] = normalize_search(
        " ".join(filter(None, [data.name, data.description]))
    )
    stmt = insert(systems).values(**values).returning(*systems.c)
    row = conn.execute(stmt).mappings().one()
    return _to_dto(row)


def get_system(system_id: UUID, conn: Connection) -> System | None:
    print("system_id:", repr(system_id), type(system_id))
    print("database:", conn.engine.url.render_as_string(hide_password=True))
    print("transaction:", conn.in_transaction())
    stmt = select(systems).where(systems.c.id == system_id)
    row = conn.execute(stmt).mappings().one_or_none()
    print(row)
    return _to_dto(row) if row is not None else None


def list_systems(
    conn: Connection,
    *,
    limit: int,
    offset: int,
    search: str | None,
    sort_by: SystemSortBy,
    sort_order: SystemSortOrder,
) -> tuple[list[System], int]:
    conditions = []

    if search:
        normalized_search = normalize_search(search)

        if normalized_search:
            conditions.append(
                systems.c.search_text.contains(
                    normalized_search,
                    autoescape=True,
                )
            )

    sort_columns = {
        SystemSortBy.ID: systems.c.id,
        SystemSortBy.NAME: func.lower(systems.c.name),
        SystemSortBy.DESCRIPTION: func.lower(systems.c.description),
        SystemSortBy.CREATED_AT: systems.c.created_at,
        SystemSortBy.UPDATED_AT: systems.c.updated_at,
    }

    sort_column = sort_columns[sort_by]

    if sort_order == SystemSortOrder.DESC:
        order_expression = [sort_column.desc()]
    else:
        order_expression = [sort_column.asc()]
    order_expression.extend(
        [
            systems.c.updated_at.desc(),
            systems.c.created_at.desc(),
            systems.c.id.asc(),
        ]
    )

    data_stmt = (
        select(systems)
        .where(*conditions)
        .order_by(*order_expression)
        .limit(limit)
        .offset(offset)
    )

    count_stmt = select(func.count()).select_from(systems).where(*conditions)

    rows = conn.execute(data_stmt).mappings().all()
    total = conn.execute(count_stmt).scalar_one()

    return [_to_dto(row) for row in rows], total


def update_system(
    system_id: UUID, data: SystemUpdate, conn: Connection
) -> System | None:
    existing = get_system(system_id, conn)
    if existing is None:
        return None

    changes = data.model_dump(exclude_unset=True)

    name = changes.get("name", existing.name)
    description = changes.get("description", existing.description)

    changes["search_text"] = normalize_search(
        " ".join(filter(None, [name, description]))
    )
    stmt = (
        update(systems)
        .where(systems.c.id == system_id)
        .values(**changes)
        .returning(*systems.c)
    )
    row = conn.execute(stmt).mappings().one_or_none()
    return _to_dto(row) if row is not None else None


def delete_system(system_id: UUID, conn: Connection) -> bool:
    stmt = delete(systems).where(systems.c.id == system_id).returning(systems.c.id)
    deleted_id = conn.execute(stmt).scalar_one_or_none()
    return deleted_id is not None
