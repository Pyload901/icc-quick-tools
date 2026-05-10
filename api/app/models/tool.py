"""Tool model for storing external tool links."""

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class Tool(SQLModel, table=True):
    """External tool bookmark (flag submitter, traffic analyzer, etc.)."""

    __tablename__ = "tools"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, description="Display name of the tool")
    url: str = Field(description="URL to the external tool")
    description: str = Field(default="", description="Short description of what the tool does")
    category: str = Field(default="general", description="Category: general, exploit, defense, analysis")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp",
    )
