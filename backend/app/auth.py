import base64
import json
import hmac
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Union
from starlette.requests import HTTPConnection
from fastapi import Request, WebSocket, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.config import JWT_SECRET
from app.db import get_db
from app.models.user import User, UserRole, Role, AccountStatus
from app.models.moderation import UserSuspension


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _b64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode("utf-8"))


def create_access_token(
    user_id: int,
    role: str,
    email: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate a tamper-proof HS256 JWT access token."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = datetime.now(timezone.utc)
    delta = expires_delta or timedelta(days=7)
    exp = int((now + delta).timestamp())
    iat = int(now.timestamp())

    payload = {
        "sub": str(user_id),
        "user_id": user_id,
        "role": role,
        "email": email,
        "iat": iat,
        "exp": exp,
    }

    header_bytes = json.dumps(header, separators=(",", ":")).encode("utf-8")
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")

    encoded_header = _b64url_encode(header_bytes)
    encoded_payload = _b64url_encode(payload_bytes)

    signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    encoded_sig = _b64url_encode(signature)

    return f"{encoded_header}.{encoded_payload}.{encoded_sig}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and cryptographically verify an HS256 JWT access token."""
    try:
        parts = token.strip().split(".")
        if len(parts) != 3:
            return None

        encoded_header, encoded_payload, encoded_sig = parts
        signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        expected_sig = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
        actual_sig = _b64url_decode(encoded_sig)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload_bytes = _b64url_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode("utf-8"))

        # Verify expiration
        exp = payload.get("exp")
        if exp and datetime.now(timezone.utc).timestamp() > exp:
            return None

        return payload
    except Exception:
        return None


def extract_token_from_request(request: HTTPConnection) -> Optional[str]:
    """Extract bearer token, custom header, cookie, or query param from request or websocket."""
    # 1. Standard Authorization: Bearer <token>
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()

    # 2. X-Auth-Token header
    custom_token = request.headers.get("X-Auth-Token")
    if custom_token:
        return custom_token.strip()

    # 3. Cookie fallback
    token_cookie = request.cookies.get("bayanihan_token")
    if token_cookie:
        return token_cookie.strip()

    # 4. Query param fallback (for WebSockets / SSE)
    token_query = request.query_params.get("token")
    if token_query:
        return token_query.strip()

    return None


def get_current_user_optional(
    request: HTTPConnection,
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Retrieve current user if a valid token is present; returns None otherwise."""
    token = extract_token_from_request(request)
    if not token:
        return None

    payload = decode_access_token(token)
    if not payload:
        return None

    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        return None

    try:
        uid_int = int(user_id)
    except (ValueError, TypeError):
        return None

    user = (
        db.query(User)
        .options(
            joinedload(User.profile),
            joinedload(User.account_status),
            joinedload(User.user_roles).joinedload(UserRole.role),
        )
        .filter(User.user_id == uid_int)
        .first()
    )
    return user


def get_current_user(
    request: HTTPConnection,
    db: Session = Depends(get_db),
) -> User:
    """
    Enforce server-side user authentication.
    Rejects missing, expired, or tampered tokens.
    """
    user = get_current_user_optional(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in with a valid account.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check suspension
    now_dt = datetime.now()
    active_susp = (
        db.query(UserSuspension)
        .filter(UserSuspension.user_id == user.user_id, UserSuspension.status == "ACTIVE")
        .order_by(UserSuspension.suspension_id.desc())
        .first()
    )

    if user.is_suspended or (user.account_status and user.account_status.status_code == "SUSPENDED"):
        if active_susp and active_susp.expires_at and active_susp.expires_at <= now_dt:
            active_susp.status = "EXPIRED"
            user.is_suspended = False
            user.account_status_id = 2
            db.commit()
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended.",
            )

    return user


def get_current_admin(
    request: HTTPConnection,
    db: Session = Depends(get_db),
) -> User:
    """
    Strict server-side role check.
    Verifies that the caller has an active 'admin' role in the database.
    Prevents role spoofing and unauthorized access to administrative endpoints.
    """
    user = get_current_user(request, db)

    # Check DB role records
    role_names = [ur.role.role_name.lower() for ur in user.user_roles if ur.role]
    if "admin" not in role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required.",
        )

    return user
