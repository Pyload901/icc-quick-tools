"""Target matrix API endpoints — PASSIVE ONLY, no network calls."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import config_crud, service_crud
from app.database import get_session
from app.schemas.target_schemas import TargetMatrixResponse
from app.services.target_service import generate_target_matrix

router = APIRouter(prefix="/targets", tags=["targets"])


@router.get("", response_model=TargetMatrixResponse)
async def get_target_matrix(
    session: AsyncSession = Depends(get_session),
) -> TargetMatrixResponse:
    """
    Generate the full target matrix based on team_id and total_teams from config.
    
    This is STRICTLY PASSIVE — no network calls are made.
    All IPs are computed mathematically from the game rules.
    """
    config = await config_crud.get_config(session)

    # Build services map from discovered services
    all_services = await service_crud.get_all_services(session)
    services_map: dict[int, list[str]] = {}
    for svc in all_services:
        if svc.vulnbox_id not in services_map:
            services_map[svc.vulnbox_id] = []
        services_map[svc.vulnbox_id].append(f"{svc.name}:{svc.port}")

    return generate_target_matrix(
        team_id=config.team_id,
        total_teams=config.total_teams,
        services_map=services_map,
    )
