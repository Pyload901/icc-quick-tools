"""FastAPI dependency — verify JWT token on protected routes."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.auth_service import validate_session_token

_bearer = HTTPBearer(auto_error=False)


def require_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> None:
    """
    FastAPI dependency that validates the JWT Bearer token.
    Raises 401 if missing or invalid.
    Attach to any router or individual endpoint with:
        dependencies=[Depends(require_auth)]
    """
    if credentials is None or not validate_session_token(credentials.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
