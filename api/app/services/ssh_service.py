"""SSH service for vulnbox management — RESTRICTED to own team IPs only."""

import io
import logging
import re
import zipfile
from typing import Optional

import asyncssh

logger = logging.getLogger(__name__)

# Safety: regex that ONLY matches our team's vulnbox IPs
TEAM_IP_PATTERN = re.compile(r"^10\.6[0-9]\.(\d+)\.1$")


def validate_team_ip(ip: str, team_id: int) -> bool:
    """Validate that an IP belongs to our team's vulnboxes. SECURITY CRITICAL."""
    match = TEAM_IP_PATTERN.match(ip)
    if not match:
        return False
    return int(match.group(1)) == team_id


def generate_vulnbox_ip(vulnbox_id: int, team_id: int) -> str:
    """Generate IP for a specific vulnbox."""
    return f"10.6{vulnbox_id}.{team_id}.1"


def generate_ssh_command(vulnbox_id: int, team_id: int) -> str:
    """Generate pre-formatted SSH command string."""
    ip = generate_vulnbox_ip(vulnbox_id, team_id)
    return f"ssh root@{ip}"


async def discover_services(
    vulnbox_id: int,
    team_id: int,
    ssh_password: str,
) -> list[dict[str, str]]:
    """
    Connect via SSH and run `docker ps` to discover running challenge containers.
    
    SAFETY: Only connects to 10.6x.<team_id>.1 — validated before connection.
    
    Returns list of {"name": ..., "port": ...} dicts.
    """
    ip = generate_vulnbox_ip(vulnbox_id, team_id)

    # CRITICAL: Validate IP belongs to our team
    if not validate_team_ip(ip, team_id):
        raise ValueError(f"Security violation: IP {ip} does not belong to team {team_id}")

    logger.info(f"Discovering services on vulnbox {vulnbox_id} at {ip}")

    try:
        async with asyncssh.connect(
            ip,
            username="root",
            password=ssh_password,
            known_hosts=None,
            connect_timeout=10,
        ) as conn:
            result = await conn.run(
                'docker ps --format "{{.Names}} - {{.Ports}}"',
                check=True,
                timeout=15,
            )
            return _parse_docker_ps_output(result.stdout or "")
    except asyncssh.Error as e:
        logger.error(f"SSH connection failed for vulnbox {vulnbox_id}: {e}")
        raise ConnectionError(f"SSH connection to {ip} failed: {str(e)}")
    except Exception as e:
        logger.error(f"Service discovery failed for vulnbox {vulnbox_id}: {e}")
        raise


def _parse_docker_ps_output(output: str) -> list[dict[str, str]]:
    """Parse docker ps output into structured service data."""
    services = []
    for line in output.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        parts = line.split(" - ", 1)
        name = parts[0].strip()
        port = parts[1].strip() if len(parts) > 1 else "N/A"
        if name:
            services.append({"name": name, "port": port})
    return services


async def download_artifacts(
    vulnbox_id: int,
    team_id: int,
    ssh_password: str,
    remote_path: str = "/root",
) -> bytes:
    """
    Download challenge files from a vulnbox via SFTP and return as ZIP bytes.
    
    SAFETY: Only connects to 10.6x.<team_id>.1 — validated before connection.
    """
    ip = generate_vulnbox_ip(vulnbox_id, team_id)

    # CRITICAL: Validate IP belongs to our team
    if not validate_team_ip(ip, team_id):
        raise ValueError(f"Security violation: IP {ip} does not belong to team {team_id}")

    logger.info(f"Downloading artifacts from vulnbox {vulnbox_id} at {ip}:{remote_path}")

    try:
        async with asyncssh.connect(
            ip,
            username="root",
            password=ssh_password,
            known_hosts=None,
            connect_timeout=10,
        ) as conn:
            async with conn.start_sftp_client() as sftp:
                zip_buffer = io.BytesIO()
                with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
                    await _recursive_download(sftp, remote_path, "", zf)
                zip_buffer.seek(0)
                return zip_buffer.read()
    except asyncssh.Error as e:
        logger.error(f"SFTP connection failed for vulnbox {vulnbox_id}: {e}")
        raise ConnectionError(f"SFTP connection to {ip} failed: {str(e)}")


async def _recursive_download(sftp, remote_dir: str, local_prefix: str, zf: zipfile.ZipFile, max_depth: int = 5) -> None:
    """Recursively download files from remote directory into a ZIP archive."""
    if max_depth <= 0:
        return

    try:
        entries = await sftp.listdir(remote_dir)
    except Exception:
        return

    for entry in entries:
        if entry in (".", "..", ".ssh", ".bash_history", "proc", "sys", "dev"):
            continue
        remote_path = f"{remote_dir}/{entry}"
        archive_path = f"{local_prefix}/{entry}" if local_prefix else entry

        try:
            attrs = await sftp.stat(remote_path)
            if attrs.permissions is not None and (attrs.permissions & 0o40000):
                # Directory
                await _recursive_download(sftp, remote_path, archive_path, zf, max_depth - 1)
            else:
                # File — skip if larger than 50MB
                if attrs.size and attrs.size > 50 * 1024 * 1024:
                    continue
                data = await sftp.read(remote_path)
                if isinstance(data, bytes):
                    zf.writestr(archive_path, data)
        except Exception as e:
            logger.warning(f"Skipping {remote_path}: {e}")
