"""CRUD operations for game configuration."""

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.game_config import GameConfig


async def get_config(session: AsyncSession) -> GameConfig:
    """Get the singleton game config, creating it if it doesn't exist."""
    result = await session.execute(select(GameConfig).where(GameConfig.id == 1))
    config = result.scalar_one_or_none()
    if config is None:
        config = GameConfig(id=1)
        session.add(config)
        await session.commit()
        await session.refresh(config)
    return config


async def update_config(session: AsyncSession, **kwargs) -> GameConfig:
    """Update game configuration fields."""
    config = await get_config(session)
    for key, value in kwargs.items():
        if value is not None and hasattr(config, key):
            setattr(config, key, value)
    config.updated_at = datetime.now(timezone.utc)
    session.add(config)
    await session.commit()
    await session.refresh(config)
    return config
