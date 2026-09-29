import hashlib
import secrets
from datetime import datetime, date, timezone, timedelta
from typing import Optional
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request, Response, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError

from app.db import get_db
from app.auth import (
    create_access_token,
    get_current_user,
    create_moodle_session,
    set_moodle_cookies,
    clear_moodle_cookies,
)
from app.limiter import limiter
from app.models.user import User, Profile, UserRole, Role, AccountStatus, ProfilePicture, PasswordReset
from app.models.user_session import UserSession
from app.models.verification import (
    IdentityVerification,
    IdType,
    VerificationStatus,
    FacialVerificationStatus,
)
import re
from app.models.moderation import UserSuspension
from app.schemas.auth import (
    RegisterRequestDto,
    LoginRequestDto,
    AuthResponseDto,
    ForgotPasswordRequestDto,
    ResetPasswordRequestDto,
    ChangePasswordRequestDto,
    GenericResponseDto,
    ValidateStep1RequestDto,
    CheckAvailabilityResponseDto,
)
from app.services.email import EmailService
from app.services.biometric_engine import mask_id_number
from app.services.terminal_logger import terminal_logger
import app.config as config

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


def normalize_phone_number(phone: Optional[str]) -> str:
    """
    Normalize Philippine mobile phone numbers to 11-digit canonical format: 09XXXXXXXXX.
    Strips spaces, dashes, parentheses, dots, slashes, and handles:
    - 09XXXXXXXXX -> 09XXXXXXXXX
    - +639XXXXXXXXX -> 09XXXXXXXXX
    - 639XXXXXXXXX -> 09XXXXXXXXX
    - 9XXXXXXXXX (10 digits) -> 09XXXXXXXXX
    """
    if not phone:
        return ""
    cleaned = re.sub(r"[\s\-\(\)\.\/\+]", "", str(phone).strip())
    if cleaned.startswith("639") and len(cleaned) == 12:
        cleaned = "09" + cleaned[3:]
    elif cleaned.startswith("9") and len(cleaned) == 10:
        cleaned = "09" + cleaned
    return cleaned


def normalize_full_name(name: Optional[str]) -> str:
    """Trim, collapse multiple spaces, and lowercase."""
    if not name:
        return ""
    return " ".join(str(name).strip().lower().split())


def check_duplicate_full_name(
    db: Session,
    full_name: str,
    clean_email: str = "",
    clean_phone: str = "",
    id_number: Optional[str] = None,
) -> Optional[dict]:
    """
    Checks for an existing account with the same normalized full name (trimmed, collapsed spaces, case-insensitive).
    Soft check rule:
    - If full name matches AND it also matches email, phone, or ID number -> block with conflict error.
    - If full name matches but NONE of email, phone, or ID match -> flag/log as soft duplicate, do not block.
    """
    norm_name = normalize_full_name(full_name)
    if not norm_name:
        return None

    profiles = db.query(Profile).all()
    for prof in profiles:
        prof_name = normalize_full_name(f"{prof.first_name} {prof.last_name}")
        if prof_name == norm_name:
            user = db.query(User).filter(User.user_id == prof.user_id).first()
            p_email = user.email.strip().lower() if user else ""
            p_phone = normalize_phone_number(prof.phone)

            id_matched = False
            if id_number:
                clean_id = id_number.strip().lower()
                existing_verif = (
                    db.query(IdentityVerification)
                    .filter(
                        IdentityVerification.user_id == prof.user_id,
                        IdentityVerification.id_number == clean_id,
                    )
                    .first()
                )
                if existing_verif:
                    id_matched = True

            if (clean_email and p_email == clean_email) or (clean_phone and p_phone == clean_phone) or id_matched:
                return {
                    "field": "fullName",
                    "error_code": "DUPLICATE_ACCOUNT",
                    "message": "An account matching this name and contact details is already registered.",
                }
            else:
                terminal_logger.info(
                    f"Likely duplicate name flagged for administrative review: '{norm_name}' (existing user_id={prof.user_id})",
                    category="Registration",
                )
    return None


@router.get("/check-availability", response_model=CheckAvailabilityResponseDto)
@limiter.limit("30/minute")
def check_availability(
    request: Request,
    field: str = Query(..., description="Field to check: email, username, phone, or fullName"),
    value: str = Query(..., description="Value to check"),
    email: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Lightweight debounced endpoint to check field availability during registration.
    """
    clean_val = value.strip().lower()

    if field == "email":
        if not clean_val or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean_val):
            return CheckAvailabilityResponseDto(available=False, field="email", message="Please enter a valid email address.")
        exists = db.query(User).filter(User.email == clean_val).first()
        if exists:
            return CheckAvailabilityResponseDto(available=False, field="email", message="This email is already registered.")
        return CheckAvailabilityResponseDto(available=True, field="email")

    elif field == "username":
        if not clean_val or len(clean_val) < 3:
            return CheckAvailabilityResponseDto(available=False, field="username", message="Username must be at least 3 characters.")
        exists = db.query(Profile).filter(Profile.username == clean_val).first()
        if exists:
            return CheckAvailabilityResponseDto(available=False, field="username", message="This username is already taken.")
        return CheckAvailabilityResponseDto(available=True, field="username")

    elif field == "phone":
        normalized = normalize_phone_number(value)
        if not re.match(r"^09\d{9}$", normalized):
            return CheckAvailabilityResponseDto(available=False, field="phone", message="Please enter a valid 11-digit Philippine mobile number.")
        all_profiles = db.query(Profile).all()
        for p in all_profiles:
            if normalize_phone_number(p.phone) == normalized:
                return CheckAvailabilityResponseDto(available=False, field="phone", message="This phone number is already registered.")
        return CheckAvailabilityResponseDto(available=True, field="phone")

    elif field == "fullName":
        norm_name = normalize_full_name(value)
        if not norm_name or len(norm_name) < 2:
            return CheckAvailabilityResponseDto(available=False, field="fullName", message="Please enter your legal full name.")
        dup_conflict = check_duplicate_full_name(
            db,
            value,
            clean_email=email.strip().lower() if email else "",
            clean_phone=normalize_phone_number(phone) if phone else "",
        )
        if dup_conflict:
            return CheckAvailabilityResponseDto(available=False, field="fullName", message=dup_conflict["message"])
        return CheckAvailabilityResponseDto(available=True, field="fullName")

    return CheckAvailabilityResponseDto(available=True, field=field)


@router.post("/validate-step1", response_model=GenericResponseDto)
@limiter.limit("15/minute")
def validate_step1(request: Request, dto: ValidateStep1RequestDto, db: Session = Depends(get_db)):
    """
    Pre-validates Step 1 registration inputs (email, username, phone, full name, anti-bot).
    Provides immediate, actionable field-level feedback to users before ID verification.
    """
    clean_email = dto.email.strip().lower()
    clean_username = dto.username.strip().lower()
    clean_phone = normalize_phone_number(dto.phone) if dto.phone else ""

    # 1. Anti-bot honeypot check (only triggered by automated scripts filling hidden fields)
    if getattr(dto, "bayanihan_hp_check", None) and str(dto.bayanihan_hp_check).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "field": "general",
                "error_code": "SECURITY_VALIDATION_FAILED",
                "message": "We couldn't continue your registration. Your submission was blocked by our security check. Please refresh the page and try again.",
            },
        )

    # 2. Validate email format
    email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not re.match(email_regex, clean_email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "success": False,
                "field": "email",
                "error_code": "INVALID_EMAIL",
                "message": "Please enter a valid email address.",
            },
        )

    # 3. Validate unique email
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "success": False,
                "field": "email",
                "error_code": "EMAIL_EXISTS",
                "message": "This email is already registered.",
            },
        )

    # 4. Validate unique username
    existing_profile = db.query(Profile).filter(Profile.username == clean_username).first()
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "success": False,
                "field": "username",
                "error_code": "USERNAME_TAKEN",
                "message": "This username is already taken.",
            },
        )

    # 5. Validate phone if provided
    if dto.phone:
        if not re.match(r"^09\d{9}$", clean_phone):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "success": False,
                    "field": "phone",
                    "error_code": "INVALID_PHONE",
                    "message": "Please enter a valid 11-digit Philippine mobile number.",
                },
            )
        all_profiles = db.query(Profile).all()
        for p in all_profiles:
            if normalize_phone_number(p.phone) == clean_phone:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "success": False,
                        "field": "phone",
                        "error_code": "PHONE_EXISTS",
                        "message": "This phone number is already registered.",
                    },
                )

    # 6. Full name soft duplicate check
    if dto.full_name:
        dup_conflict = check_duplicate_full_name(
            db, dto.full_name, clean_email=clean_email, clean_phone=clean_phone
        )
        if dup_conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "success": False,
                    "field": dup_conflict["field"],
                    "error_code": dup_conflict["error_code"],
                    "message": dup_conflict["message"],
                },
            )

    return GenericResponseDto(success=True, message="Step 1 information is valid.")


@router.post("/register", response_model=AuthResponseDto, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, dto: RegisterRequestDto, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Register a new user in the Bayanihan Hub MySQL database.
    CRITICAL POLICY: Newly registered users are ALWAYS set to account_status 'PENDING'.
    They cannot sign in until an administrator reviews and approves their identity documents.
    """
    clean_email = dto.email.strip().lower()
    clean_username = dto.username.strip().lower()

    clean_phone = normalize_phone_number(dto.phone) if dto.phone else ""

    # 0. Anti-bot honeypot protection (only triggered by automated scripts filling hidden trap)
    if getattr(dto, "bayanihan_hp_check", None) and str(dto.bayanihan_hp_check).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "field": "general",
                "error_code": "SECURITY_VALIDATION_FAILED",
                "message": "We couldn't continue your registration. Your submission was blocked by our security check. Please refresh the page and try again.",
            },
        )

    # 1. Validate unique email
    existing_user_by_email = db.query(User).filter(User.email == clean_email).first()
    if existing_user_by_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "success": False,
                "field": "email",
                "error_code": "EMAIL_EXISTS",
                "message": "This email is already registered.",
            },
        )

    # 2. Validate unique username
    existing_profile_by_username = (
        db.query(Profile).filter(Profile.username == clean_username).first()
    )
    if existing_profile_by_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "success": False,
                "field": "username",
                "error_code": "USERNAME_TAKEN",
                "message": "This username is already taken.",
            },
        )

    # 3. Validate unique phone
    if dto.phone:
        if not re.match(r"^09\d{9}$", clean_phone):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "success": False,
                    "field": "phone",
                    "error_code": "INVALID_PHONE",
                    "message": "Please enter a valid 11-digit Philippine mobile number.",
                },
            )
        all_profiles = db.query(Profile).all()
        for p in all_profiles:
            if normalize_phone_number(p.phone) == clean_phone:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "success": False,
                        "field": "phone",
                        "error_code": "PHONE_EXISTS",
                        "message": "This phone number is already registered.",
                    },
                )

    # 4. Full name soft duplicate check
    if dto.full_name:
        dup_conflict = check_duplicate_full_name(
            db,
            dto.full_name,
            clean_email=clean_email,
            clean_phone=clean_phone,
            id_number=dto.id_number,
        )
        if dup_conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "success": False,
                    "field": dup_conflict["field"],
                    "error_code": dup_conflict["error_code"],
                    "message": dup_conflict["message"],
                },
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
            phone=clean_phone or "N/A",
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
                confidence_score=int(getattr(dto, "verification_confidence", None) or 95),
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
    except IntegrityError as ie:
        db.rollback()
        err_str = str(ie).lower()
        terminal_logger.warning(
            f"Database unique constraint conflict during registration: {err_str}",
            category="Registration",
        )
        if "uq_users_email" in err_str or "email" in err_str:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"field": "email", "message": "This email is already registered."},
            )
        if "uq_profiles_username" in err_str or "username" in err_str:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"field": "username", "message": "This username is already taken."},
            )
        if "uq_profiles_phone" in err_str or "phone" in err_str:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"field": "phone", "message": "This phone number is already registered."},
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"field": "general", "message": "An account with these details already exists."},
        )
    except Exception as exc:
        db.rollback()
        terminal_logger.error(f"Failed to register user in database: {str(exc)}", category="Backend")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration could not be completed. Please try again.",
        )


@router.post("/login", response_model=AuthResponseDto)
@limiter.limit("5/minute")
def login(request: Request, response: Response, dto: LoginRequestDto, db: Session = Depends(get_db)):
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

    # Generate tamper-proof HS256 JWT access token
    access_token = create_access_token(user.user_id, primary_role, user.email)
    user_data["token"] = access_token

    # Update last active timestamp
    user.last_active_at = datetime.now(timezone.utc)
    db.commit()

    # Session rotation: Invalidate old sessions and create fresh MoodleSession
    try:
        db.query(UserSession).filter(UserSession.user_id == user.user_id).update({"is_active": False})
        session_token = create_moodle_session(user.user_id, request, db)
        set_moodle_cookies(response, request, session_token, user_data["username"])
    except Exception as e:
        terminal_logger.warning(f"Failed to initialize MoodleSession for {user.email}: {e}")

    terminal_logger.integration("Backend", "Authentication Service", f"Credentials verified for {user.email}", status="SUCCESS")
    terminal_logger.success(f"User '{full_name}' authenticated successfully ({primary_role.upper()})", category="AUTH")

    return AuthResponseDto(
        success=True,
        message="Login successful.",
        user=user_data,
        token=access_token,
        account_status="APPROVED",
    )

@router.post("/forgot-password", response_model=GenericResponseDto)
@limiter.limit("5/minute")
def forgot_password(
    request: Request,
    dto: ForgotPasswordRequestDto,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = dto.email.strip().lower()
    try:
        user = db.query(User).filter(User.email == email).first()

        if user:
            # Generate secure token and store its SHA-256 hash
            token = secrets.token_urlsafe(32)
            hashed_token = hashlib.sha256(token.encode("utf-8")).hexdigest()
            expires = datetime.now() + timedelta(hours=1)

            # Invalidate old active tokens
            db.query(PasswordReset).filter(
                PasswordReset.user_id == user.user_id, PasswordReset.used == False
            ).update({"used": True})

            pr = PasswordReset(
                user_id=user.user_id,
                token=hashed_token,
                expires_at=expires,
                used=False,
            )
            db.add(pr)
            db.commit()

            email_addr = user.email
            fname = user.profile.first_name if user.profile else "User"

            # Dispatch email via background task to prevent request timeouts / 500s on SMTP delays
            background_tasks.add_task(
                EmailService.send_password_reset_email,
                to_email=email_addr,
                reset_token=token,  # Send raw token to user
                username=fname,
            )

            reset_url = f"{config.FRONTEND_URL}/reset-password?token={token}"
            terminal_logger.info(
                f"Password reset link generated for {user.email}: {reset_url}",
                category="AUTH",
            )
            return GenericResponseDto(
                success=True,
                message="If an account exists for this email address, instructions have been sent. Please check your inbox.",
            )

        # If user does not exist, return safe generic message to prevent account enumeration
        return GenericResponseDto(
            success=True,
            message="If an account exists for this email address, instructions have been sent. Please check your inbox.",
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        terminal_logger.error(f"Error processing password reset request for {email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error_code": "SERVER_ERROR",
                "message": "Unable to process password reset request. Please try again later.",
            },
        )


@router.get("/validate-reset-token", response_model=GenericResponseDto)
@router.get("/reset-password", response_model=GenericResponseDto)
def validate_reset_token(token: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """
    Validates a password reset token on page load.
    Returns:
    - 200 OK if token exists and is unexpired
    - 400 Bad Request if token is missing
    - 404 Not Found if token does not exist or has already been used
    - 401 Unauthorized if token has expired
    """
    if not token or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error_code": "MISSING_TOKEN",
                "message": "Reset token is required.",
            },
        )

    raw_token = token.strip()
    hashed_token = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    pr = (
        db.query(PasswordReset)
        .filter(PasswordReset.token == hashed_token, PasswordReset.used == False)
        .first()
    )
    if not pr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error_code": "INVALID_TOKEN",
                "message": "This password reset link is invalid or has expired.",
            },
        )

    now_dt = datetime.now()
    exp = (
        pr.expires_at.replace(tzinfo=None)
        if (hasattr(pr.expires_at, "tzinfo") and pr.expires_at.tzinfo)
        else pr.expires_at
    )
    if exp < now_dt:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error_code": "TOKEN_EXPIRED",
                "message": "This password reset link is invalid or has expired.",
            },
        )

    user = db.query(User).filter(User.user_id == pr.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error_code": "USER_NOT_FOUND",
                "message": "User account associated with this token was not found.",
            },
        )

    return GenericResponseDto(
        success=True,
        message="Reset token is valid.",
    )


@router.post("/reset-password", response_model=GenericResponseDto)
@limiter.limit("5/minute")
def reset_password(
    request: Request,
    dto: ResetPasswordRequestDto,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    raw_token = dto.token.strip()
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error_code": "MISSING_TOKEN",
                "message": "Reset token is required.",
            },
        )

    hashed_token = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    new_password = dto.new_password

    # 1. Check confirm password if provided
    if dto.confirm_password and dto.new_password != dto.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error_code": "PASSWORD_MISMATCH",
                "message": "New passwords do not match.",
            },
        )

    try:
        # 2. Validate token and active status
        pr = (
            db.query(PasswordReset)
            .filter(PasswordReset.token == hashed_token, PasswordReset.used == False)
            .first()
        )
        if not pr:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "error_code": "INVALID_TOKEN",
                    "message": "This password reset link is invalid or has expired.",
                },
            )

        now_dt = datetime.now()
        exp = (
            pr.expires_at.replace(tzinfo=None)
            if (hasattr(pr.expires_at, "tzinfo") and pr.expires_at.tzinfo)
            else pr.expires_at
        )
        if exp < now_dt:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "success": False,
                    "error_code": "TOKEN_EXPIRED",
                    "message": "This password reset link is invalid or has expired.",
                },
            )

        user = db.query(User).filter(User.user_id == pr.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "error_code": "USER_NOT_FOUND",
                    "message": "User account associated with this token was not found.",
                },
            )

        # 3. Hash new password with bcrypt
        hashed = hash_password(new_password)
        user.password_hash = hashed
        user.updated_at = datetime.now()

        # 4. Invalidate used token
        pr.used = True

        # 5. Invalidate all active sessions for this user for security
        db.query(UserSession).filter(UserSession.user_id == user.user_id).update({"is_active": False})

        db.commit()
        db.refresh(user)

        # 6. Verify database update immediately
        if not verify_password(new_password, user.password_hash):
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "success": False,
                    "error_code": "UPDATE_FAILED",
                    "message": "Password update could not be verified in the database. Please try again.",
                },
            )

        email_addr = user.email
        fname = user.profile.first_name if user.profile else "User"

        # 7. Dispatch success email
        background_tasks.add_task(
            EmailService.send_password_reset_success_email,
            to_email=email_addr,
            username=fname,
        )

        terminal_logger.crud("UPDATE", "User", details=f"Password reset successfully for {user.email}")
        return GenericResponseDto(
            success=True,
            message="Your password has been reset successfully. You can now log in with your new password.",
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        terminal_logger.error(f"Error resetting password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error_code": "SERVER_ERROR",
                "message": "Unable to reset your password. Please try again.",
            },
        )

@router.post("/logout", response_model=GenericResponseDto)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    """Invalidates the active server-side MoodleSession and expires session cookies."""
    clear_moodle_cookies(response, request, db)
    return GenericResponseDto(success=True, message="Logged out successfully.")

@router.post("/change-password")
@limiter.limit("5/minute")
def change_password(
    request: Request,
    response: Response,
    dto: ChangePasswordRequestDto,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Secure password change endpoint for authenticated users.
    Validates current password, enforces password complexity, updates password hash,
    rotates MoodleSession, and dispatches security alert email.
    """
    # 1. Verify current password
    if not verify_password(dto.current_password, current_user.password_hash):
        terminal_logger.warning(f"Failed password change attempt for {current_user.email} (incorrect current password)", category="AUTH")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error_code": "INCORRECT_CURRENT_PASSWORD",
                "message": "Current password is incorrect.",
            },
        )

    # 2. Check if new password is identical to current password
    if verify_password(dto.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error_code": "SAME_PASSWORD",
                "message": "Your new password cannot be the same as your current password.",
            },
        )

    # 3. Check confirmation if provided
    if dto.confirm_password and dto.new_password != dto.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error_code": "PASSWORD_MISMATCH",
                "message": "New passwords do not match.",
            },
        )

    try:
        # 4. Update database password hash
        current_user.password_hash = hash_password(dto.new_password)
        current_user.updated_at = datetime.now()

        # 5. Session rotation: Invalidate old sessions and create fresh MoodleSession
        db.query(UserSession).filter(UserSession.user_id == current_user.user_id).update({"is_active": False})
        new_session_token = create_moodle_session(current_user.user_id, request, db)
        user_identifier = current_user.profile.username if current_user.profile else current_user.email.split("@")[0]
        set_moodle_cookies(response, request, new_session_token, user_identifier)

        db.commit()
        db.refresh(current_user)

        # Verify database update immediately
        if not verify_password(dto.new_password, current_user.password_hash):
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "success": False,
                    "error_code": "UPDATE_FAILED",
                    "message": "Password update could not be verified in the database. Please try again.",
                },
            )

        # 6. Issue refreshed JWT access token for client state
        primary_role = "admin" if any(ur.role.role_name.lower() == "admin" for ur in current_user.user_roles if ur.role) else "user"
        new_token = create_access_token(current_user.user_id, primary_role, current_user.email)

        # 7. Queue security email notification via BackgroundTasks
        fname = current_user.profile.first_name if current_user.profile else "User"
        change_time = datetime.now().strftime("%B %d, %Y at %I:%M %p UTC")
        background_tasks.add_task(
            EmailService.send_password_changed_security_email,
            to_email=current_user.email,
            username=fname,
            timestamp_str=change_time,
        )

        terminal_logger.info(f"Password changed and security alert queued for {current_user.email}", category="AUTH")

        return {
            "success": True,
            "message": "Your password has been changed successfully.",
            "token": new_token,
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        terminal_logger.error(f"Error changing password for {current_user.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error_code": "SERVER_ERROR",
                "message": "Unable to update password right now. Please try again later.",
            },
        )

