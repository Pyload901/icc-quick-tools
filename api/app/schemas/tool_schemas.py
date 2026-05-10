"""Pydantic schemas for tool CRUD operations."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl


class ToolCreate(BaseModel):
    """Request schema for creating a new tool."""

    name: str
    url: str
    description: str = ""
    category: str = "general"


class ToolUpdate(BaseModel):
    """Request schema for updating an existing tool."""

    name: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


class ToolResponse(BaseModel):
    """Response schema for a tool."""

    id: int
    name: str
    url: str
    description: str
    category: str
    created_at: datetime
