"""Pydantic schemas for services and vulnboxes."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ServiceCreate(BaseModel):
    """Request schema for manually adding a service."""

    vulnbox_id: int
    name: str
    port: str


class ServiceResponse(BaseModel):
    """Response schema for a service."""

    id: int
    vulnbox_id: int
    name: str
    port: str
    is_auto_discovered: bool
    created_at: datetime


class VulnboxInfo(BaseModel):
    """Aggregated vulnbox information."""

    vulnbox_id: int
    ip: str
    ssh_command: str
    services: list[ServiceResponse] = []


class ServiceDiscoveryRequest(BaseModel):
    """Request to trigger service discovery on a specific vulnbox."""

    vulnbox_id: int


class RepoInfo(BaseModel):
    """A discovered git repository (directory) found under /root on a vulnbox."""

    dir_name: str
    remote_path: str
    git_clone_cmd: str
