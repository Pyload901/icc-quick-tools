"""Background task for periodically fetching Flag IDs from the game API."""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

import httpx

from app.config import settings
from app.crud import flag_id_crud
from app.database import async_session

logger = logging.getLogger(__name__)


class FlagIdFetcher:
    """Manages the background Flag ID fetching task."""

    def __init__(self) -> None:
        self._task: Optional[asyncio.Task] = None
        self._running: bool = False
        self.last_fetch_at: Optional[datetime] = None
        self.last_error: Optional[str] = None

    @property
    def is_running(self) -> bool:
        return self._running and self._task is not None and not self._task.done()

    def start(self, tick_seconds: int = 120) -> None:
        """Start the background fetcher loop."""
        if self.is_running:
            logger.warning("Flag ID fetcher is already running")
            return
        self._running = True
        self._task = asyncio.create_task(self._fetch_loop(tick_seconds))
        logger.info("Flag ID fetcher started")

    def stop(self) -> None:
        """Stop the background fetcher loop."""
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()
        logger.info("Flag ID fetcher stopped")

    async def _fetch_loop(self, tick_seconds: int) -> None:
        """Main fetch loop — runs every tick_seconds with rate limiting."""
        while self._running:
            try:
                await self._fetch_once()
                self.last_error = None
            except asyncio.CancelledError:
                break
            except Exception as e:
                self.last_error = str(e)
                logger.error(f"Flag ID fetch error: {e}")

            # Rate-limited: wait for next tick
            await asyncio.sleep(tick_seconds)

    async def _fetch_once(self) -> None:
        """Fetch flag IDs from the game API and store them."""
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(settings.flag_id_api_url)
            response.raise_for_status()
            data = response.json()

        # Parse the nested JSON structure:
        # { service: { team_id: { round: { description: value } } } }
        async with async_session() as session:
            for service_name, teams in data.items():
                if not isinstance(teams, dict):
                    continue
                for team_id_str, rounds in teams.items():
                    if not isinstance(rounds, dict):
                        continue
                    try:
                        tid = int(team_id_str)
                    except ValueError:
                        continue
                    for round_str, flag_data in rounds.items():
                        if not isinstance(flag_data, dict):
                            continue
                        try:
                            round_num = int(round_str)
                        except ValueError:
                            continue
                        for desc, value in flag_data.items():
                            await flag_id_crud.upsert_flag_id(
                                session=session,
                                service=service_name,
                                team_id=tid,
                                round_num=round_num,
                                flag_id_description=desc,
                                flag_id_value=str(value),
                            )

        self.last_fetch_at = datetime.now(timezone.utc)
        logger.info(f"Flag IDs fetched successfully at {self.last_fetch_at}")

    async def fetch_now(self) -> None:
        """Trigger a single immediate fetch (for manual refresh)."""
        await self._fetch_once()


# Singleton instance
flag_id_fetcher = FlagIdFetcher()
