"""Pydantic schemas for game configuration requests and responses."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class GameConfigUpdate(BaseModel):
    """Request schema for updating game configuration."""

    team_id: Optional[int] = None
    team_token: Optional[str] = None
    ssh_password: Optional[str] = None
    game_tick_seconds: Optional[int] = None
    total_teams: Optional[int] = None


class GameConfigResponse(BaseModel):
    """Response schema for game configuration (token masked)."""

    id: int
    team_id: int
    team_token_masked: str
    ssh_password_masked: str
    game_tick_seconds: int
    total_teams: int
    updated_at: Optional[datetime] = None


class GameConfigFullResponse(BaseModel):
    """Full response with unmasked sensitive fields (for settings page reveal)."""

    id: int
    team_id: int
    team_token: str
    ssh_password: str
    game_tick_seconds: int
    total_teams: int
    updated_at: Optional[datetime] = None
