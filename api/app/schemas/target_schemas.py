"""Pydantic schemas for target matrix and flag IDs."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# --- Target Matrix ---

class TargetIP(BaseModel):
    """A single target IP with its vulnbox and service info."""

    vulnbox_id: int
    ip: str
    services: list[str] = []


class TeamTargets(BaseModel):
    """All targets for a specific team."""

    team_id: int
    label: str  # "Own Team", "NPC 1", "NPC 2", "Team X"
    is_own: bool = False
    is_npc: bool = False
    targets: list[TargetIP] = []


class TargetMatrixResponse(BaseModel):
    """Full target matrix response."""

    teams: list[TeamTargets] = []


# --- Flag IDs ---

class FlagIdResponse(BaseModel):
    """Response schema for a flag ID entry."""

    id: int
    service: str
    team_id: int
    round: int
    flag_id_description: str
    flag_id_value: str
    fetched_at: datetime


class FlagIdListResponse(BaseModel):
    """Paginated flag ID list."""

    items: list[FlagIdResponse] = []
    total: int = 0
    page: int = 1
    page_size: int = 50


class FetcherStatusResponse(BaseModel):
    """Background fetcher status."""

    running: bool
    last_fetch_at: Optional[datetime] = None
    error: Optional[str] = None
