"""CRUD operations for discovered/manual services on vulnboxes."""

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.service import Service


async def create_service(
    session: AsyncSession,
    vulnbox_id: int,
    name: str,
    port: str,
    is_auto_discovered: bool = True,
) -> Service:
    """Create a new service entry."""
    service = Service(
        vulnbox_id=vulnbox_id,
        name=name,
        port=port,
        is_auto_discovered=is_auto_discovered,
    )
    session.add(service)
    await session.commit()
    await session.refresh(service)
    return service


async def get_services_by_vulnbox(session: AsyncSession, vulnbox_id: int) -> list[Service]:
    """Get all services for a specific vulnbox."""
    result = await session.execute(
        select(Service).where(Service.vulnbox_id == vulnbox_id).order_by(Service.name)
    )
    return list(result.scalars().all())


async def get_all_services(session: AsyncSession) -> list[Service]:
    """Get all services across all vulnboxes."""
    result = await session.execute(select(Service).order_by(Service.vulnbox_id, Service.name))
    return list(result.scalars().all())


async def get_service_by_id(session: AsyncSession, service_id: int) -> Optional[Service]:
    """Get a single service by ID."""
    result = await session.execute(select(Service).where(Service.id == service_id))
    return result.scalar_one_or_none()


async def delete_service(session: AsyncSession, service_id: int) -> bool:
    """Delete a service by ID."""
    service = await get_service_by_id(session, service_id)
    if service is None:
        return False
    await session.delete(service)
    await session.commit()
    return True


async def delete_services_by_vulnbox(session: AsyncSession, vulnbox_id: int, auto_only: bool = True) -> int:
    """Delete services for a vulnbox. If auto_only, only delete auto-discovered ones."""
    result = await session.execute(
        select(Service).where(
            Service.vulnbox_id == vulnbox_id,
            Service.is_auto_discovered == True if auto_only else True,
        )
    )
    services = result.scalars().all()
    count = 0
    for service in services:
        await session.delete(service)
        count += 1
    await session.commit()
    return count


async def update_service(session: AsyncSession, service_id: int, **kwargs) -> Optional[Service]:
    """Update a service's fields."""
    service = await get_service_by_id(session, service_id)
    if service is None:
        return None
    for key, value in kwargs.items():
        if value is not None and hasattr(service, key):
            setattr(service, key, value)
    session.add(service)
    await session.commit()
    await session.refresh(service)
    return service
