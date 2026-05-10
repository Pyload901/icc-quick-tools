"""Service model for discovered/manual challenge services on vulnboxes."""

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class Service(SQLModel, table=True):
    """A challenge service running on a vulnbox (auto-discovered or manual)."""

    __tablename__ = "services"

    id: Optional[int] = Field(default=None, primary_key=True)
    vulnbox_id: int = Field(index=True, description="Vulnbox identifier (0-9)")
    name: str = Field(description="Service/container name")
    port: str = Field(description="Exposed port(s), e.g. '8080/tcp'")
    is_auto_discovered: bool = Field(default=True, description="True if found via docker ps")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Discovery timestamp",
    )
