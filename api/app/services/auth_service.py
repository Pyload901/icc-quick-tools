"""
Auth service — password hashing, verification, and JWT generation.

Uses:
  - bcrypt directly (avoids passlib 1.7.4 / bcrypt 4.x incompatibility)
  - PyJWT for stateless session tokens
"""

import logging
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.config import settings

logger = logging.getLogger(__name__)


def hash_code(plain_password: str) -> str:
    """Hash a plain-text password with bcrypt."""
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_code(plain_password: str, hashed_password: str) -> bool:
    """Check a plain-text password against the stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_session_token() -> str:
    """
    Create a signed JWT session token.
    The token carries a minimal payload — just expiry and a static subject.
    No user-specific data since the panel is single-user.
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(hours=settings.jwt_expire_hours)
    payload = {
        "sub": "ctf-panel-session",
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def validate_session_token(token: str) -> bool:
    """Validate a JWT session token. Returns True if valid and not expired."""
    try:
        jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        return True
    except jwt.ExpiredSignatureError:
        logger.warning("Rejected expired session token")
        return False
    except jwt.InvalidTokenError:
        logger.warning("Rejected invalid session token")
        return False
