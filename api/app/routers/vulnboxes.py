"""Vulnbox management API endpoints — SSH restricted to own team only."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import config_crud, service_crud
from app.database import get_session
from app.schemas.service_schemas import (
    RepoInfo,
    ServiceCreate,
    ServiceResponse,
    VulnboxInfo,
)
from app.services import ssh_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vulnboxes", tags=["vulnboxes"])


@router.get("", response_model=list[VulnboxInfo])
async def list_vulnboxes(session: AsyncSession = Depends(get_session)) -> list[VulnboxInfo]:
    """List all 10 vulnboxes with their SSH commands and discovered services."""
    config = await config_crud.get_config(session)
    vulnboxes = []
    for vbox_id in range(10):
        ip = ssh_service.generate_vulnbox_ip(vbox_id, config.team_id)
        ssh_cmd = ssh_service.generate_ssh_command(vbox_id, config.team_id)
        services = await service_crud.get_services_by_vulnbox(session, vbox_id)
        vulnboxes.append(VulnboxInfo(
            vulnbox_id=vbox_id,
            ip=ip,
            ssh_command=ssh_cmd,
            services=[ServiceResponse(**s.model_dump()) for s in services],
        ))
    return vulnboxes


@router.post("/{vulnbox_id}/discover", response_model=list[ServiceResponse])
async def discover_services(
    vulnbox_id: int,
    session: AsyncSession = Depends(get_session),
) -> list[ServiceResponse]:
    """
    Trigger Docker service discovery on a specific vulnbox via SSH.
    
    SAFETY: Connection restricted to 10.6x.<TEAM_ID>.1 only.
    """
    if vulnbox_id < 0 or vulnbox_id > 9:
        raise HTTPException(status_code=400, detail="vulnbox_id must be between 0 and 9")

    config = await config_crud.get_config(session)
    if not config.ssh_password:
        raise HTTPException(status_code=400, detail="SSH password not configured. Update it in Settings.")

    try:
        discovered = await ssh_service.discover_services(
            vulnbox_id=vulnbox_id,
            team_id=config.team_id,
            ssh_password=config.ssh_password,
        )
    except ConnectionError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

    # Clear old auto-discovered services for this vulnbox and save new ones
    await service_crud.delete_services_by_vulnbox(session, vulnbox_id, auto_only=True)

    result = []
    for svc in discovered:
        service = await service_crud.create_service(
            session,
            vulnbox_id=vulnbox_id,
            name=svc["name"],
            port=svc["port"],
            is_auto_discovered=True,
        )
        result.append(ServiceResponse(**service.model_dump()))

    return result


@router.post("/services", response_model=ServiceResponse, status_code=201)
async def add_manual_service(
    body: ServiceCreate,
    session: AsyncSession = Depends(get_session),
) -> ServiceResponse:
    """Manually add a service to a vulnbox (for non-Docker services)."""
    if body.vulnbox_id < 0 or body.vulnbox_id > 9:
        raise HTTPException(status_code=400, detail="vulnbox_id must be between 0 and 9")

    service = await service_crud.create_service(
        session,
        vulnbox_id=body.vulnbox_id,
        name=body.name,
        port=body.port,
        is_auto_discovered=False,
    )
    return ServiceResponse(**service.model_dump())


@router.delete("/services/{service_id}", status_code=204)
async def delete_service(
    service_id: int,
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a service entry."""
    deleted = await service_crud.delete_service(session, service_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Service with id {service_id} not found")


@router.get("/{vulnbox_id}/repos", response_model=list[RepoInfo])
async def scan_repos(
    vulnbox_id: int,
    session: AsyncSession = Depends(get_session),
) -> list[RepoInfo]:
    """
    SSH into a vulnbox and list directories under /root as potential git repos.
    Returns a git-clone-over-SSH command for each directory found.

    SAFETY: Connection restricted to 10.6x.<TEAM_ID>.1 only.
    """
    if vulnbox_id < 0 or vulnbox_id > 9:
        raise HTTPException(status_code=400, detail="vulnbox_id must be between 0 and 9")

    config = await config_crud.get_config(session)
    if not config.ssh_password:
        raise HTTPException(status_code=400, detail="SSH password not configured. Update it in Settings.")

    try:
        repos = await ssh_service.scan_root_repos(
            vulnbox_id=vulnbox_id,
            team_id=config.team_id,
            ssh_password=config.ssh_password,
        )
    except ConnectionError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return [RepoInfo(**r) for r in repos]


@router.get("/{vulnbox_id}/artifacts")
async def download_artifacts(
    vulnbox_id: int,
    remote_path: str = "/root",
    session: AsyncSession = Depends(get_session),
):
    """
    Download challenge files from a vulnbox as a ZIP archive.
    
    SAFETY: Connection restricted to 10.6x.<TEAM_ID>.1 only.
    """
    if vulnbox_id < 0 or vulnbox_id > 9:
        raise HTTPException(status_code=400, detail="vulnbox_id must be between 0 and 9")

    config = await config_crud.get_config(session)
    if not config.ssh_password:
        raise HTTPException(status_code=400, detail="SSH password not configured. Update it in Settings.")

    try:
        zip_bytes = await ssh_service.download_artifacts(
            vulnbox_id=vulnbox_id,
            team_id=config.team_id,
            ssh_password=config.ssh_password,
            remote_path=remote_path,
        )
    except ConnectionError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"vulnbox_{vulnbox_id}_{timestamp}.zip"

    return StreamingResponse(
        iter([zip_bytes]),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
