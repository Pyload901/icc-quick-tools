"""CRUD operations for flag IDs intelligence data."""

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import func, select

from app.models.flag_id import FlagId


async def upsert_flag_id(
    session: AsyncSession,
    service: str,
    team_id: int,
    round_num: int,
    flag_id_description: str,
    flag_id_value: str,
) -> FlagId:
    """Insert or update a flag ID entry."""
    result = await session.execute(
        select(FlagId).where(
            FlagId.service == service,
            FlagId.team_id == team_id,
            FlagId.round == round_num,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.flag_id_description = flag_id_description
        existing.flag_id_value = flag_id_value
        session.add(existing)
        await session.commit()
        await session.refresh(existing)
        return existing

    flag_id = FlagId(
        service=service,
        team_id=team_id,
        round=round_num,
        flag_id_description=flag_id_description,
        flag_id_value=flag_id_value,
    )
    session.add(flag_id)
    await session.commit()
    await session.refresh(flag_id)
    return flag_id


async def get_flag_ids(
    session: AsyncSession,
    service: Optional[str] = None,
    team_id: Optional[int] = None,
    round_num: Optional[int] = None,
    page: int = 1,
    page_size: int = 50,
) -> tuple[list[FlagId], int]:
    """Get flag IDs with optional filters, ordered newest first. Returns (items, total)."""
    query = select(FlagId)
    count_query = select(func.count()).select_from(FlagId)

    if service:
        query = query.where(FlagId.service == service)
        count_query = count_query.where(FlagId.service == service)
    if team_id is not None:
        query = query.where(FlagId.team_id == team_id)
        count_query = count_query.where(FlagId.team_id == team_id)
    if round_num is not None:
        query = query.where(FlagId.round == round_num)
        count_query = count_query.where(FlagId.round == round_num)

    # Get total count
    total_result = await session.execute(count_query)
    total = total_result.scalar_one()

    # Get paginated results ordered newest first
    query = query.order_by(FlagId.round.desc(), FlagId.team_id).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    items = list(result.scalars().all())

    return items, total


async def get_distinct_services(session: AsyncSession) -> list[str]:
    """Get list of unique service names for filter dropdowns."""
    result = await session.execute(select(FlagId.service).distinct().order_by(FlagId.service))
    return [row[0] for row in result.all()]


async def get_flag_id_count(session: AsyncSession) -> int:
    """Get total count of flag IDs."""
    result = await session.execute(select(func.count()).select_from(FlagId))
    return result.scalar_one()
