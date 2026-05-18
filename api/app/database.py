"""SQLModel database engine and session management."""

import logging
import os
from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

logger = logging.getLogger(__name__)

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

DATABASE_URL = "sqlite+aiosqlite:///./data/ctf_panel.db"

engine = create_async_engine(DATABASE_URL, echo=False)

async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def _run_migrations() -> None:
    """
    Apply lightweight schema migrations for new columns.
    SQLite does not support IF NOT EXISTS on ALTER TABLE, so we check
    the column list first and only add missing columns.
    """
    async with engine.begin() as conn:
        # Check existing columns on game_config
        result = await conn.execute(text("PRAGMA table_info(game_config)"))
        existing = {row[1] for row in result.fetchall()}

        migrations = [
            ("access_code_hash", "ALTER TABLE game_config ADD COLUMN access_code_hash TEXT"),
        ]
        for col, sql in migrations:
            if col not in existing:
                await conn.execute(text(sql))
                logger.info(f"Migration: added column '{col}' to game_config")


async def init_db() -> None:
    """Create all tables on startup, then apply any pending column migrations."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    await _run_migrations()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a database session."""
    async with async_session() as session:
        yield session
