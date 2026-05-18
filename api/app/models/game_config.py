"""Game configuration model stored in SQLite."""

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class GameConfig(SQLModel, table=True):
    """Stores core game configuration: team identity and game timing."""

    __tablename__ = "game_config"

    id: int = Field(default=1, primary_key=True)
    team_id: int = Field(default=2, description="Team identifier in the competition")
    team_token: str = Field(default="", description="Token for flag submission API")
    ssh_password: str = Field(default="", description="Root SSH password for all vulnboxes")
    game_tick_seconds: int = Field(default=120, description="Duration of each game tick in seconds")
    total_teams: int = Field(default=30, description="Total number of teams in competition")
    access_code_hash: Optional[str] = Field(
        default=None,
        description="Bcrypt hash of the panel access code — None means onboarding not complete",
    )
    updated_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp",
    )
