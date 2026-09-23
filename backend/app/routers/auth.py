import hashlib
import secrets
from datetime import datetime, date, timezone, timedelta
from typing import Optional
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, select

from app.db import get_db
from app.limiter import limiter
from app.models.user import User, Profile, UserRole, Role, AccountStatus, ProfilePicture, PasswordReset
from app.models.verification import (
    IdentityVerification,
    IdType,
    VerificationStatus,
    FacialVerificationStatus,
)
from app.models.moderation import UserSuspension
from app.schemas.auth import (
    RegisterRequestDto,
    LoginRequestDto,
    AuthResponseDto,
    ForgotPasswordRequestDto,
    ResetPasswordRequestDto,
    GenericResponseDto,
)
from app.services.email import EmailService
from app.services.biometric_engine import mask_id_number
from app.services.terminal_logger import terminal_logger

router = APIRouter(prefix="/api/auth", tags=["Authentication & Registration"])


def hash_password(password: str) -> str:
    """Securely hash a password using bcrypt."""
    # Truncate to 72 bytes per bcrypt specification
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against bcrypt hash, with backward-compatibility
    fallback for legacy SHA-256 and plaintext passwords.
    """
    if not hashed_password or not plain_password:
        return False
    # 1. Bcrypt verification
    if hashed_password.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8"))
        except Exception:
            return False
    # 2. Legacy SHA-256 verification
    legacy_hash = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    if hashed_password == legacy_hash:
        return True
    # 3. Legacy Plaintext comparison (for zero-downtime migration of test accounts)
    if hashed_password == plain_password:
        return True
    return False


def parse_date(date_str: Optional[str]) -> Optional[date]:
    """Safely parse ISO date string (YYYY-MM-DD)."""
    if not date_str:
        return None
    try:
        clean = date_str.strip().split("T")[0]
        return datetime.strptime(clean, "%Y-%m-%d").date()
    except Exception:
        return None


@router.post("/register", response_model=AuthResponseDto, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
def register(request: Request, dto: RegisterRequestDto, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Register a new user in the Bayanihan Hub MySQL database.
    CRITICAL POLICY: Newly registered users are ALWAYS set to account_status 'PENDING'.
    They cannot sign in until an administrator reviews and approves their identity documents.
    """
    clean_email = dto.email.strip().lower()
    clean_username = dto.username.strip().lower()

    # 1. Validate unique email
    existing_user_by_email = db.query(User).filter(User.email == clean_email).first()
    if existing_user_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # 2. Validate unique username
    existing_profile_by_username = (
        db.query(Profile).filter(Profile.username == clean_username).first()
    )
    if existing_profile_by_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is already taken.",
        )

    try:
        # 3. Create User record with account_status_id=1 (PENDING)
        # Check that account_status_id 1 exists or look up status_code='PENDING'
        pending_status = (
            db.query(AccountStatus).filter(AccountStatus.status_code == "PENDING").first()
        )
        pending_status_id = pending_status.account_status_id if pending_status else 1

        new_user = User(
            email=clean_email,
            password_hash=hash_password(dto.password),
            account_status_id=pending_status_id,
            is_suspended=False,
            is_trusted=False,
        )
        db.add(new_user)
        db.flush()  # Flush to generate new_user.user_id

        # 4. Assign default 'user' role (role_id=2)
        user_role_record = (
            db.query(Role).filter(Role.role_name == "user").first()
        )
        role_id = user_role_record.role_id if user_role_record else 2
        user_role_entry = UserRole(user_id=new_user.user_id, role_id=role_id)
        db.add(user_role_entry)

        # 5. Parse Name
        full_name_parts = dto.full_name.strip().split()
        first_name = full_name_parts[0] if full_name_parts else "User"
        last_name = " ".join(full_name_parts[1:]) if len(full_name_parts) > 1 else first_name

        # 6. Create Profile record
        profile = Profile(
            user_id=new_user.user_id,
            username=clean_username,
            first_name=first_name,
            middle_name=None,
            last_name=last_name,
            phone=dto.phone or "N/A",
            bio="Community Member",
            address_line=dto.address or "Address",
            barangay=dto.barangay or "Poblacion",
            municipality=dto.municipality or "San Fernando",
            province=dto.province or "La Union",
        )
        db.add(profile)

        # 7. Create Identity Verification application if ID info was submitted
        verification_id_str = None
        if dto.id_type and dto.id_number:
            # Match ID Type
            id_type_record = (
                db.query(IdType)
                .filter(or_(IdType.type_name == dto.id_type, IdType.label == dto.id_type))
                .first()
            )
            if not id_type_record:
                id_type_record = db.query(IdType).first()

            # Status lookups
            facial_status = (
                db.query(FacialVerificationStatus)
                .filter(FacialVerificationStatus.status_code == "PASSED")
                .first()
            )
            verif_status = (
                db.query(VerificationStatus)
                .filter(VerificationStatus.status_code == "PENDING")
                .first()
            )

            dob_parsed = parse_date(dto.dob) or date(2000, 1, 1)
            exp_parsed = parse_date(dto.expiration_date)

            masked_id = mask_id_number(dto.id_number)

            id_verif = IdentityVerification(
                user_id=new_user.user_id,
                id_type_id=id_type_record.id_type_id if id_type_record else 1,
                id_number=dto.id_number.strip(),
                masked_id_number=masked_id,
                full_name_on_id=dto.full_name_on_id or dto.full_name,
                date_of_birth=dob_parsed,
                expiration_date=exp_parsed,
                extra_info=dto.extra_info,
                document_reference=dto.id_document_url or "",
                facial_selfie_reference=dto.face_image_url or "",
                facial_verification_status_id=facial_status.status_id if facial_status else 2,
                verification_status_id=verif_status.verification_status_id if verif_status else 1,
                confidence_score=int(dto.verification_confidence or 95),
                provider="BayanihanHub-Biometric-Engine",
            )
            db.add(id_verif)
            db.flush()
            verification_id_str = str(id_verif.identity_verification_id)

        # 8. Create ProfilePicture record if face image was provided
        if dto.face_image_url:
            pfp = ProfilePicture(
                user_id=new_user.user_id,
                file_reference=dto.face_image_url,
                status_id=1,  # PENDING
                is_active=True,
            )
            db.add(pfp)

        db.commit()
        db.refresh(new_user)

        user_data = {
            "id": f"user-{new_user.user_id}",
            "userId": new_user.user_id,
            "fullName": dto.full_name,
            "username": clean_username,
            "email": clean_email,
            "phone": dto.phone,
            "address": dto.address,
            "barangay": dto.barangay,
            "municipality": dto.municipality,
            "province": dto.province,
            "avatar": dto.face_image_url or "",
            "role": "user",
            "isVerified": False,
            "account_status": "PENDING",
            "facial_verification_status": "PASSED",
            "id_verification_status": "SUBMITTED",
            "verificationStatus": "PENDING",
            "idType": dto.id_type,
            "maskedIdNumber": mask_id_number(dto.id_number) if dto.id_number else "",
            "isTrusted": False,
            "isSuspended": False,
        }

        terminal_logger.crud("CREATE", "User", details=f"New neighbor registered: {clean_email} ({dto.full_name})")
        terminal_logger.integration("Backend", "Verification Service", "Created identity verification record", status="SUCCESS")

        email_addr = clean_email
        fname = dto.full_name.split()[0]
        # Send Registration Email via BackgroundTasks
        background_tasks.add_task(EmailService.send_registration_email, email_addr, fname)

        return AuthResponseDto(
            success=True,
            message="Account registration submitted successfully. Your account is PENDING administrator review and approval.",
            user=user_data,
            account_status="PENDING",
            verification_id=verification_id_str,
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user in database: {str(exc)}",
        )


@router.post("/login", response_model=AuthResponseDto)
@limiter.limit("5/minute")
def login(request: Request, dto: LoginRequestDto, db: Session = Depends(get_db)):
    """
    Authenticate a user against the Bayanihan Hub MySQL database.
    CRITICAL POLICY: Users with status 'PENDING' or 'REJECTED' CANNOT log in.
    """
    identifier = dto.email.strip().lower()

    # Find user by email, profile username, or admin aliases
    user_filters = [User.email == identifier, Profile.username == identifier]
    if identifier in ("admin@bayanihanhub.com", "admin@bayanihan.ph", "admin"):
        user_filters.extend([User.email == "admin@bayanihanhub.com", User.email == "admin@bayanihan.ph", Profile.username == "admin"])

    user = (
        db.query(User)
        .options(
            joinedload(User.profile),
            joinedload(User.account_status),
            joinedload(User.user_roles).joinedload(UserRole.role),
        )
        .outerjoin(Profile, Profile.user_id == User.user_id)
        .filter(or_(*user_filters))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again.",
        )

    # Verify password (secure bcrypt with fallback for legacy hashes and plaintext)
    if not verify_password(dto.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again.",
        )

    # Automatic zero-downtime migration: re-hash to bcrypt if legacy or plaintext
    if not user.password_hash.startswith(("$2a$", "$2b$", "$2y$")):
        user.password_hash = hash_password(dto.password)
        db.commit()

    # Check suspension lifecycle
    now_dt = datetime.now()
    active_suspension = (
        db.query(UserSuspension)
        .filter(UserSuspension.user_id == user.user_id, UserSuspension.status == "ACTIVE")
        .order_by(UserSuspension.suspension_id.desc())
        .first()
    )

    if user.is_suspended or (user.account_status and user.account_status.status_code == "SUSPENDED"):
        if active_suspension:
            # Check if temporary suspension has expired
            if active_suspension.expires_at and active_suspension.expires_at <= now_dt:
                # Auto-lift expired suspension
                active_suspension.status = "EXPIRED"
                user.is_suspended = False
                user.account_status_id = 2  # APPROVED
                db.commit()
                db.refresh(user)
            else:
                # Suspension is actively in effect
                if active_suspension.expires_at:
                    date_str = active_suspension.expires_at.strftime("%B %d, %Y")
                    time_str = active_suspension.expires_at.strftime("%I:%M %p")
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Your Bayanihan Hub account is currently suspended until {date_str} at {time_str}.",
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Your Bayanihan Hub account has been permanently suspended.",
                    )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your Bayanihan Hub account has been suspended by an administrator.",
            )

    status_code = user.account_status.status_code if user.account_status else "PENDING"

    # Enforce PENDING check
    if status_code == "PENDING":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is still pending administrator verification. Please wait until your registration has been reviewed.",
        )

    # Enforce REJECTED check
    if status_code == "REJECTED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your registration was not approved. Please review the provided information or contact an administrator.",
        )

    if status_code != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account requires administrator review before sign in.",
        )

    # Determine role
    role_names = [ur.role.role_name for ur in user.user_roles if ur.role]
    primary_role = "admin" if "admin" in role_names else "user"

    # Full name and details from profile
    profile = user.profile
    full_name = (
        f"{profile.first_name} {profile.last_name}".strip()
        if profile
        else user.email.split("@")[0]
    )

    user_data = {
        "id": f"user-{user.user_id}",
        "userId": user.user_id,
        "email": user.email,
        "username": profile.username if profile else user.email.split("@")[0],
        "fullName": full_name,
        "phone": profile.phone if profile else "",
        "address": profile.address_line if profile else "",
        "barangay": profile.barangay if profile else "",
        "municipality": profile.municipality if profile else "",
        "province": profile.province if profile else "",
        "avatar": "",
        "role": primary_role,
        "isVerified": True,
        "account_status": "APPROVED",
        "verificationStatus": "APPROVED",
        "facial_verification_status": "PASSED",
        "id_verification_status": "VERIFIED",
        "isTrusted": user.is_trusted,
        "isSuspended": user.is_suspended,
    }

    # Update last active timestamp
    user.last_active_at = datetime.now(timezone.utc)
    db.commit()

    terminal_logger.integration("Backend", "Authentication Service", f"Credentials verified for {user.email}", status="SUCCESS")
    terminal_logger.success(f"User '{full_name}' authenticated successfully ({primary_role.upper()})", category="AUTH")

    return AuthResponseDto(
        success=True,
        message="Login successful.",
        user=user_data,
        account_status="APPROVED",
    )

@router.post("/forgot-password", response_model=GenericResponseDto)
@limiter.limit("5/minute")
def forgot_password(request: Request, dto: ForgotPasswordRequestDto, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email = dto.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Generate token and store its hash
        token = secrets.token_urlsafe(32)
        hashed_token = hashlib.sha256(token.encode("utf-8")).hexdigest()
        expires = datetime.now() + timedelta(hours=1)
        
        # Invalidate old active tokens
        db.query(PasswordReset).filter(PasswordReset.user_id == user.user_id, PasswordReset.used == False).update({"used": True})
        
        pr = PasswordReset(
            user_id=user.user_id,
            token=hashed_token,
            expires_at=expires,
            used=False
        )
        db.add(pr)
        db.commit()
        
        email_addr = user.email
        fname = user.profile.first_name if user.profile else "User"
        
        # Send Email via BackgroundTasks
        background_tasks.add_task(
            EmailService.send_password_reset_email,
            to_email=email_addr,
            reset_token=token,  # Send raw token to user
            username=fname
        )
        
    # Always return success to prevent email enumeration
    return GenericResponseDto(success=True, message="If an account exists, a reset email has been sent.")

@router.post("/reset-password", response_model=GenericResponseDto)
@limiter.limit("5/minute")
def reset_password(request: Request, dto: ResetPasswordRequestDto, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    raw_token = dto.token
    hashed_token = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    new_password = dto.new_password
    
    pr = db.query(PasswordReset).filter(PasswordReset.token == hashed_token, PasswordReset.used == False).first()
    if not pr:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    if pr.expires_at < datetime.now():
        raise HTTPException(status_code=400, detail="Reset token has expired")
        
    user = db.query(User).filter(User.user_id == pr.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Hash new password
    hashed = hash_password(new_password)
    user.password_hash = hashed
    user.updated_at = datetime.now()
    
    pr.used = True
    db.commit()
    
    email_addr = user.email
    fname = user.profile.first_name if user.profile else "User"
    
    # Send success email
    background_tasks.add_task(
        EmailService.send_password_reset_success_email,
        to_email=email_addr,
        username=fname
    )
    
    terminal_logger.crud("UPDATE", "User", details=f"Password reset successfully for {user.email}")
    return GenericResponseDto(success=True, message="Password has been reset successfully.")

