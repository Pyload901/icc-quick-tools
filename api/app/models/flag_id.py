"""FlagId model for intelligence gathered from the game API."""

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class FlagId(SQLModel, table=True):
    """Flag ID intelligence fetched from the game system API."""

    __tablename__ = "flag_ids"

    id: Optional[int] = Field(default=None, primary_key=True)
    service: str = Field(index=True, description="Service short name (e.g. 'foobar')")
    team_id: int = Field(index=True, description="Team ID the flag belongs to")
    round: int = Field(index=True, description="Game round number")
    flag_id_description: str = Field(default="", description="Flag ID description key")
    flag_id_value: str = Field(default="", description="Actual flag ID value")
    fetched_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When this flag ID was fetched",
    )
