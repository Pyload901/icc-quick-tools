"""Auth API endpoints — access code setup and verification."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import config_crud
from app.database import get_session
from app.schemas.auth_schemas import (
    AuthSetupRequest,
    AuthStatusResponse,
    AuthTokenResponse,
    AuthVerifyRequest,
)
from app.services import auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/status", response_model=AuthStatusResponse)
async def get_auth_status(session: AsyncSession = Depends(get_session)) -> AuthStatusResponse:
    """
    Returns whether the panel access code has been configured.
    Used by the frontend to decide whether to show onboarding or the login screen.
    This endpoint is intentionally public (no auth required).
    """
    config = await config_crud.get_config(session)
    return AuthStatusResponse(configured=config.access_code_hash is not None)


@router.post("/setup", response_model=AuthTokenResponse, status_code=201)
async def setup_access_code(
    body: AuthSetupRequest,
    session: AsyncSession = Depends(get_session),
) -> AuthTokenResponse:
    """
    Set the panel access code for the first time (onboarding).
    Can only be called once — returns 409 if a code is already set.
    To change the code later, use PUT /auth/code with the current code.
    """
    config = await config_crud.get_config(session)
    if config.access_code_hash is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Access code already configured. Use PUT /api/auth/code to change it.",
        )

    hashed = auth_service.hash_code(body.code)
    await config_crud.update_config(session, access_code_hash=hashed)
    logger.info("Panel access code configured for the first time")

    # Log in immediately after setup
    token = auth_service.create_session_token()
    return AuthTokenResponse(token=token)


@router.post("/verify", response_model=AuthTokenResponse)
async def verify_access_code(
    body: AuthVerifyRequest,
    session: AsyncSession = Depends(get_session),
) -> AuthTokenResponse:
    """
    Verify the access code and issue a JWT session token.
    Returns 401 on wrong code — intentionally vague to avoid enumeration.
    """
    config = await config_crud.get_config(session)

    if config.access_code_hash is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Panel not yet configured. Complete onboarding first.",
        )

    if not auth_service.verify_code(body.code, config.access_code_hash):
        logger.warning("Failed login attempt with wrong access code")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access code.",
        )

    logger.info("Successful panel login")
    token = auth_service.create_session_token()
    return AuthTokenResponse(token=token)


@router.put("/code", response_model=AuthTokenResponse)
async def change_access_code(
    body: AuthSetupRequest,
    current_code: str,
    session: AsyncSession = Depends(get_session),
) -> AuthTokenResponse:
    """
    Change the access code. Requires the current code as a query param for verification.
    Example: PUT /api/auth/code?current_code=old_code  with body {"code": "new_code"}
    """
    config = await config_crud.get_config(session)

    if config.access_code_hash is None:
        raise HTTPException(status_code=400, detail="Panel not yet configured.")

    if not auth_service.verify_code(current_code, config.access_code_hash):
        raise HTTPException(status_code=401, detail="Current access code is incorrect.")

    hashed = auth_service.hash_code(body.code)
    await config_crud.update_config(session, access_code_hash=hashed)
    logger.info("Panel access code changed successfully")

    token = auth_service.create_session_token()
    return AuthTokenResponse(token=token)
