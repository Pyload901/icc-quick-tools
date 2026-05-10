"""Target matrix generation service — STRICTLY PASSIVE, pure math only."""

import re

from app.schemas.target_schemas import TargetIP, TargetMatrixResponse, TeamTargets


def generate_vulnbox_ip(vulnbox_id: int, team_id: int) -> str:
    """Generate IP address for a vulnbox: 10.6x.y.1 where x=vulnbox_id, y=team_id."""
    return f"10.6{vulnbox_id}.{team_id}.1"


def generate_target_matrix(
    team_id: int,
    total_teams: int,
    services_map: dict[int, list[str]] | None = None,
) -> TargetMatrixResponse:
    """
    Generate the full target matrix purely from math.
    
    NO NETWORK CALLS — this function only produces IP strings.
    
    Args:
        team_id: Our team's ID.
        total_teams: Total number of teams in the competition.
        services_map: Optional dict mapping vulnbox_id -> list of service names.
    
    Returns:
        TargetMatrixResponse with own team, NPCs, and enemy teams.
    """
    if services_map is None:
        services_map = {}

    teams: list[TeamTargets] = []

    # Generate for all team IDs (0 and 1 are NPCs, 2+ are real teams)
    for tid in range(total_teams):
        targets = []
        for vbox_id in range(10):  # vulnbox_id 0-9
            ip = generate_vulnbox_ip(vbox_id, tid)
            svc_names = services_map.get(vbox_id, [])
            targets.append(TargetIP(vulnbox_id=vbox_id, ip=ip, services=svc_names))

        if tid == team_id:
            label = f"🛡️ Own Team (ID: {tid})"
            is_own = True
            is_npc = False
        elif tid in (0, 1):
            label = f"🤖 NPC {tid + 1} (ID: {tid})"
            is_own = False
            is_npc = True
        else:
            label = f"Team {tid}"
            is_own = False
            is_npc = False

        teams.append(TeamTargets(
            team_id=tid,
            label=label,
            is_own=is_own,
            is_npc=is_npc,
            targets=targets,
        ))

    return TargetMatrixResponse(teams=teams)
