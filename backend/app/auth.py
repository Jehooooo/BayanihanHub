import base64
import json
import hmac
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Union
from starlette.requests import HTTPConnection
from fastapi import Request, Response, WebSocket, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.config import JWT_SECRET, ENVIRONMENT
from app.db import get_db
from app.models.user import User, UserRole, Role, AccountStatus
from app.models.user_session import UserSession
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


def create_moodle_session(
    user_id: int,
    request: Request,
    db: Session,
    expires_days: int = 7,
) -> str:
    """Create a cryptographically random, unpredictable MoodleSession record in DB."""
    session_token = secrets.token_urlsafe(32)
    new_session = UserSession(
        user_id=user_id,
        session_token=session_token,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        is_active=True,
        expires_at=datetime.now() + timedelta(days=expires_days),
    )
    db.add(new_session)
    db.commit()
    return session_token


def set_moodle_cookies(
    response: Response,
    request: Request,
    session_token: str,
    user_identifier: str,
    expires_days: int = 7,
):
    """
    Sets Moodle-compatible cookies on the response:
    - MoodleSession: HttpOnly, Secure in prod/HTTPS, SameSite=Lax, Path=/
    - MOODLEID: Non-sensitive persistent user-identification/preference cookie (e.g. base64-encoded username)
    """
    # Determine if HTTPS: Check X-Forwarded-Proto (Render / reverse proxy), URL scheme, or production host
    forwarded_proto = request.headers.get("x-forwarded-proto", "").lower()
    host = request.headers.get("host", "").lower()
    is_localhost = "localhost" in host or "127.0.0.1" in host
    is_secure = (forwarded_proto == "https") or (request.url.scheme == "https") or (ENVIRONMENT == "production" and not is_localhost)

    # 1. MoodleSession: Authenticated session continuity (HttpOnly)
    response.set_cookie(
        key="MoodleSession",
        value=session_token,
        max_age=expires_days * 24 * 3600,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        path="/",
    )

    # 2. MOODLEID: Non-sensitive persistent identification (NOT an auth credential)
    safe_moodle_id = base64.urlsafe_b64encode(user_identifier.encode("utf-8")).decode("utf-8").rstrip("=")
    response.set_cookie(
        key="MOODLEID",
        value=safe_moodle_id,
        max_age=365 * 24 * 3600,
        httponly=False,
        secure=is_secure,
        samesite="lax",
        path="/",
    )


def clear_moodle_cookies(
    response: Response,
    request: Request,
    db: Optional[Session] = None,
):
    """Invalidates the server-side MoodleSession and expires cookies on the browser."""
    moodle_token = request.cookies.get("MoodleSession")
    if moodle_token and db:
        try:
            db.query(UserSession).filter(UserSession.session_token == moodle_token.strip()).update({"is_active": False})
            db.commit()
        except Exception:
            db.rollback()

    forwarded_proto = request.headers.get("x-forwarded-proto", "").lower()
    host = request.headers.get("host", "").lower()
    is_localhost = "localhost" in host or "127.0.0.1" in host
    is_secure = (forwarded_proto == "https") or (request.url.scheme == "https") or (ENVIRONMENT == "production" and not is_localhost)

    response.delete_cookie(key="MoodleSession", path="/", secure=is_secure, httponly=True, samesite="lax")


def extract_moodle_session_user(request: HTTPConnection, db: Session) -> Optional[User]:
    """Look up authenticated user from valid MoodleSession cookie and server-side session."""
    moodle_session = request.cookies.get("MoodleSession")
    if not moodle_session:
        return None

    session_record = (
        db.query(UserSession)
        .options(
            joinedload(UserSession.user).joinedload(User.profile),
            joinedload(UserSession.user).joinedload(User.account_status),
            joinedload(UserSession.user).joinedload(User.user_roles).joinedload(UserRole.role),
        )
        .filter(
            UserSession.session_token == moodle_session.strip(),
            UserSession.is_active == True,
            UserSession.expires_at > datetime.now(),
        )
        .first()
    )

    if session_record and session_record.user:
        try:
            session_record.last_accessed_at = datetime.now()
            db.commit()
        except Exception:
            db.rollback()
        return session_record.user

    return None


def get_current_user_optional(
    request: HTTPConnection,
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Retrieve current user if a valid session cookie or token is present; returns None otherwise."""
    # 1. First priority: Server-side MoodleSession cookie
    session_user = extract_moodle_session_user(request, db)
    if session_user:
        return session_user

    # 2. Bearer token / custom header / query param fallback
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
            detail="Your session has expired. Please sign in again.",
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
