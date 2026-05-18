"""Auth schemas for access code setup and verification."""

from pydantic import BaseModel, Field


class AuthStatusResponse(BaseModel):
    """Whether the panel access code has been configured."""

    configured: bool


class AuthSetupRequest(BaseModel):
    """Request to set the panel password for the first time."""

    code: str = Field(..., min_length=8, description="Panel password (min 8 characters)")


class AuthVerifyRequest(BaseModel):
    """Request to verify the access code and receive a JWT session token."""

    code: str


class AuthTokenResponse(BaseModel):
    """Successful authentication response containing the session token."""

    token: str
    token_type: str = "bearer"
