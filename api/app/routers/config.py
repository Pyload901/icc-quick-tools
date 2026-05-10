"""Configuration API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import config_crud
from app.database import get_session
from app.schemas.config_schemas import (
    GameConfigFullResponse,
    GameConfigResponse,
    GameConfigUpdate,
)

router = APIRouter(prefix="/config", tags=["config"])


def _mask_secret(value: str) -> str:
    """Mask a secret, showing only first 4 chars."""
    if not value or len(value) <= 4:
        return "****"
    return value[:4] + "*" * (len(value) - 4)


@router.get("", response_model=GameConfigResponse)
async def get_config(session: AsyncSession = Depends(get_session)) -> GameConfigResponse:
    """Get current game configuration with masked sensitive fields."""
    config = await config_crud.get_config(session)
    return GameConfigResponse(
        id=config.id,
        team_id=config.team_id,
        team_token_masked=_mask_secret(config.team_token),
        ssh_password_masked=_mask_secret(config.ssh_password),
        game_tick_seconds=config.game_tick_seconds,
        total_teams=config.total_teams,
        updated_at=config.updated_at,
    )


@router.get("/full", response_model=GameConfigFullResponse)
async def get_config_full(session: AsyncSession = Depends(get_session)) -> GameConfigFullResponse:
    """Get full config including unmasked secrets (for settings page reveal toggle)."""
    config = await config_crud.get_config(session)
    return GameConfigFullResponse(
        id=config.id,
        team_id=config.team_id,
        team_token=config.team_token,
        ssh_password=config.ssh_password,
        game_tick_seconds=config.game_tick_seconds,
        total_teams=config.total_teams,
        updated_at=config.updated_at,
    )


@router.put("", response_model=GameConfigResponse)
async def update_config(
    body: GameConfigUpdate,
    session: AsyncSession = Depends(get_session),
) -> GameConfigResponse:
    """Update game configuration."""
    config = await config_crud.update_config(
        session,
        team_id=body.team_id,
        team_token=body.team_token,
        ssh_password=body.ssh_password,
        game_tick_seconds=body.game_tick_seconds,
        total_teams=body.total_teams,
    )
    return GameConfigResponse(
        id=config.id,
        team_id=config.team_id,
        team_token_masked=_mask_secret(config.team_token),
        ssh_password_masked=_mask_secret(config.ssh_password),
        game_tick_seconds=config.game_tick_seconds,
        total_teams=config.total_teams,
        updated_at=config.updated_at,
    )
