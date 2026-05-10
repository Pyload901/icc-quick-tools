"""CRUD operations for external tools."""

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.tool import Tool


async def create_tool(session: AsyncSession, name: str, url: str, description: str = "", category: str = "general") -> Tool:
    """Create a new tool entry."""
    tool = Tool(name=name, url=url, description=description, category=category)
    session.add(tool)
    await session.commit()
    await session.refresh(tool)
    return tool


async def get_tools(session: AsyncSession) -> list[Tool]:
    """List all tools."""
    result = await session.execute(select(Tool).order_by(Tool.created_at.desc()))
    return list(result.scalars().all())


async def get_tool_by_id(session: AsyncSession, tool_id: int) -> Optional[Tool]:
    """Get a single tool by ID."""
    result = await session.execute(select(Tool).where(Tool.id == tool_id))
    return result.scalar_one_or_none()


async def update_tool(session: AsyncSession, tool_id: int, **kwargs) -> Optional[Tool]:
    """Update a tool's fields."""
    tool = await get_tool_by_id(session, tool_id)
    if tool is None:
        return None
    for key, value in kwargs.items():
        if value is not None and hasattr(tool, key):
            setattr(tool, key, value)
    session.add(tool)
    await session.commit()
    await session.refresh(tool)
    return tool


async def delete_tool(session: AsyncSession, tool_id: int) -> bool:
    """Delete a tool by ID. Returns True if deleted."""
    tool = await get_tool_by_id(session, tool_id)
    if tool is None:
        return False
    await session.delete(tool)
    await session.commit()
    return True
