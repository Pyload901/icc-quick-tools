"""Tools CRUD API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import tool_crud
from app.database import get_session
from app.schemas.tool_schemas import ToolCreate, ToolResponse, ToolUpdate

router = APIRouter(prefix="/tools", tags=["tools"])


@router.get("", response_model=list[ToolResponse])
async def list_tools(session: AsyncSession = Depends(get_session)) -> list[ToolResponse]:
    """List all saved tools."""
    tools = await tool_crud.get_tools(session)
    return [ToolResponse(**t.model_dump()) for t in tools]


@router.post("", response_model=ToolResponse, status_code=201)
async def create_tool(body: ToolCreate, session: AsyncSession = Depends(get_session)) -> ToolResponse:
    """Create a new tool bookmark."""
    tool = await tool_crud.create_tool(
        session, name=body.name, url=body.url, description=body.description, category=body.category
    )
    return ToolResponse(**tool.model_dump())


@router.put("/{tool_id}", response_model=ToolResponse)
async def update_tool(
    tool_id: int,
    body: ToolUpdate,
    session: AsyncSession = Depends(get_session),
) -> ToolResponse:
    """Update an existing tool."""
    tool = await tool_crud.update_tool(
        session, tool_id, name=body.name, url=body.url, description=body.description, category=body.category
    )
    if tool is None:
        raise HTTPException(status_code=404, detail=f"Tool with id {tool_id} not found")
    return ToolResponse(**tool.model_dump())


@router.delete("/{tool_id}", status_code=204)
async def delete_tool(tool_id: int, session: AsyncSession = Depends(get_session)) -> None:
    """Delete a tool by ID."""
    deleted = await tool_crud.delete_tool(session, tool_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Tool with id {tool_id} not found")
