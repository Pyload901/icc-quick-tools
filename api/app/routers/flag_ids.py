"""Flag IDs intelligence API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import config_crud, flag_id_crud
from app.database import get_session
from app.schemas.target_schemas import (
    FetcherStatusResponse,
    FlagIdListResponse,
    FlagIdResponse,
)
from app.services.flag_id_service import flag_id_fetcher

router = APIRouter(prefix="/flagids", tags=["flag-ids"])


@router.get("", response_model=FlagIdListResponse)
async def list_flag_ids(
    service: Optional[str] = None,
    team_id: Optional[int] = None,
    round: Optional[int] = None,
    page: int = 1,
    page_size: int = 50,
    session: AsyncSession = Depends(get_session),
) -> FlagIdListResponse:
    """Get flag IDs with optional filters, ordered newest first."""
    items, total = await flag_id_crud.get_flag_ids(
        session, service=service, team_id=team_id, round_num=round, page=page, page_size=page_size
    )
    return FlagIdListResponse(
        items=[FlagIdResponse(**item.model_dump()) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/services", response_model=list[str])
async def get_available_services(session: AsyncSession = Depends(get_session)) -> list[str]:
    """Get list of distinct service names for filter dropdowns."""
    return await flag_id_crud.get_distinct_services(session)


@router.get("/fetcher/status", response_model=FetcherStatusResponse)
async def get_fetcher_status() -> FetcherStatusResponse:
    """Get the background fetcher status."""
    return FetcherStatusResponse(
        running=flag_id_fetcher.is_running,
        last_fetch_at=flag_id_fetcher.last_fetch_at,
        error=flag_id_fetcher.last_error,
    )


@router.post("/fetcher/start", response_model=FetcherStatusResponse)
async def start_fetcher(session: AsyncSession = Depends(get_session)) -> FetcherStatusResponse:
    """Start the background Flag ID fetcher."""
    config = await config_crud.get_config(session)
    flag_id_fetcher.start(tick_seconds=config.game_tick_seconds)
    return FetcherStatusResponse(
        running=flag_id_fetcher.is_running,
        last_fetch_at=flag_id_fetcher.last_fetch_at,
    )


@router.post("/fetcher/stop", response_model=FetcherStatusResponse)
async def stop_fetcher() -> FetcherStatusResponse:
    """Stop the background Flag ID fetcher."""
    flag_id_fetcher.stop()
    return FetcherStatusResponse(
        running=flag_id_fetcher.is_running,
        last_fetch_at=flag_id_fetcher.last_fetch_at,
    )


@router.post("/fetcher/refresh", response_model=FetcherStatusResponse)
async def trigger_manual_fetch() -> FetcherStatusResponse:
    """Trigger a single immediate Flag ID fetch."""
    try:
        await flag_id_fetcher.fetch_now()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Fetch failed: {str(e)}")
    return FetcherStatusResponse(
        running=flag_id_fetcher.is_running,
        last_fetch_at=flag_id_fetcher.last_fetch_at,
    )


@router.get("/stats")
async def get_stats(session: AsyncSession = Depends(get_session)):
    """Get flag ID statistics for the dashboard."""
    total = await flag_id_crud.get_flag_id_count(session)
    services = await flag_id_crud.get_distinct_services(session)
    return {
        "total_flag_ids": total,
        "total_services": len(services),
        "fetcher_running": flag_id_fetcher.is_running,
        "last_fetch_at": flag_id_fetcher.last_fetch_at,
    }
