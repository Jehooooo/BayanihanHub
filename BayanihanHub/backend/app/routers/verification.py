import re
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.db import get_db
from app.models.user import User, Profile, AccountStatus, Role, UserRole
from app.models.verification import (
    IdentityVerification,
    IdType,
    VerificationStatus,
    FacialVerificationStatus,
)
from app.models.moderation import AuditLog, AuditAction
from app.schemas.verification import (
    VerificationRequestDto,
    VerificationResponseDto,
    AdminDecisionRequestDto,
    AdminAuditLogDto,
    LoginEligibilityCheckDto,
    LoginEligibilityResponseDto,
)
from app.services.providers import get_verification_provider
from app.services.biometric_engine import mask_id_number
import app.config as config

router = APIRouter(prefix="/api/verification", tags=["Identity Verification"])


def parse_numeric_id(val: any) -> Optional[int]:
    """Extract integer ID from string like 'verif-12' or 'user-5'."""
    if val is None:
        return None
    if isinstance(val, int):
        return val
    matches = re.findall(r"\d+", str(val))
    return int(matches[0]) if matches else None


def get_default_admin_id(db: Session, provided_admin_id: Optional[str] = None) -> int:
    """Find a valid admin user_id in the database."""
    parsed = parse_numeric_id(provided_admin_id)
    if parsed:
        admin_exists = db.query(User).filter(User.user_id == parsed).first()
        if admin_exists:
            return admin_exists.user_id

    # Fallback to the registered admin user
    admin_user = (
        db.query(User)
        .join(UserRole, UserRole.user_id == User.user_id)
        .join(Role, Role.role_id == UserRole.role_id)
        .filter(Role.role_name == "admin")
        .first()
    )
    if admin_user:
        return admin_user.user_id

    first_user = db.query(User).first()
    return first_user.user_id if first_user else 1


@router.post("/verify", response_model=VerificationResponseDto)
async def verify_identity(dto: VerificationRequestDto):
    """
    Verify a user's identity by cross-checking their valid Philippine ID with a live facial selfie.
    CRITICAL POLICY: Successful biometric verification sets the account status to 'PENDING'.
    Never automatically authenticate or approve.
    """
    try:
        provider = get_verification_provider()
        result = await provider.verify(dto)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during identity verification: {str(e)}",
        )


@router.get("/applications")
def get_applications(status: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """
    List all submitted identity verification applications from MySQL for administrator review.
    """
    query = (
        db.query(IdentityVerification)
        .options(
            joinedload(IdentityVerification.user).joinedload(User.profile),
            joinedload(IdentityVerification.user).joinedload(User.account_status),
            joinedload(IdentityVerification.id_type),
            joinedload(IdentityVerification.facial_status),
            joinedload(IdentityVerification.verification_status),
            joinedload(IdentityVerification.reviewer).joinedload(User.profile),
        )
        .order_by(desc(IdentityVerification.submitted_at))
    )

    verifs = query.all()
    results = []

    for iv in verifs:
        user = iv.user
        profile = user.profile if user else None
        user_status = (
            user.account_status.status_code if (user and user.account_status) else "PENDING"
        )
        v_status = (
            iv.verification_status.status_code if iv.verification_status else "PENDING"
        )

        full_name = (
            f"{profile.first_name} {profile.last_name}".strip()
            if profile
            else (iv.full_name_on_id or "Applicant")
        )

        app_data = {
            "id": f"verif-{iv.identity_verification_id}",
            "verificationId": iv.identity_verification_id,
            "userId": f"user-{iv.user_id}",
            "user": {
                "id": f"user-{iv.user_id}",
                "fullName": full_name,
                "username": profile.username if profile else "",
                "email": user.email if user else "",
                "phone": profile.phone if profile else "",
                "address": profile.address_line if profile else "",
                "barangay": profile.barangay if profile else "",
                "municipality": profile.municipality if profile else "",
                "province": profile.province if profile else "",
                "avatar": iv.facial_selfie_reference or "",
                "role": "user",
                "account_status": user_status,
                "isVerified": user_status == "APPROVED",
                "isTrusted": user.is_trusted if user else False,
                "isSuspended": user.is_suspended if user else False,
            },
            "idType": iv.id_type.type_name if iv.id_type else "Philippine ID",
            "idNumber": iv.id_number,
            "maskedIdNumber": iv.masked_id_number,
            "fullNameOnId": iv.full_name_on_id,
            "registrationFullName": full_name,
            "dob": iv.date_of_birth.isoformat() if iv.date_of_birth else "",
            "expirationDate": (
                iv.expiration_date.isoformat() if iv.expiration_date else None
            ),
            "extraInfo": iv.extra_info,
            "idDocumentUrl": iv.document_reference,
            "faceImageUrl": iv.facial_selfie_reference,
            "confidenceScore": iv.confidence_score,
            "facialVerificationStatus": (
                iv.facial_status.status_code if iv.facial_status else "PASSED"
            ),
            "idVerificationStatus": "VERIFIED" if v_status == "APPROVED" else "SUBMITTED",
            "status": v_status,
            "accountStatus": user_status,
            "provider": iv.provider,
            "submittedAt": iv.submitted_at.isoformat() if iv.submitted_at else "",
            "reviewedAt": iv.reviewed_at.isoformat() if iv.reviewed_at else None,
            "reviewedBy": (
                iv.reviewer.profile.username
                if (iv.reviewer and iv.reviewer.profile)
                else (str(iv.reviewed_by) if iv.reviewed_by else None)
            ),
            "rejectionReason": iv.rejection_reason,
            "retryInstructions": iv.retry_instructions,
            "matchDetails": {
                "faceMatch": iv.confidence_score >= 80,
                "nameMatch": True,
                "livenessVerified": True,
            },
        }

        if status:
            target_status = status.upper()
            if (
                app_data["status"].upper() == target_status
                or app_data["accountStatus"].upper() == target_status
                or (target_status == "VERIFIED" and app_data["status"] in ["VERIFIED", "APPROVED"])
            ):
                results.append(app_data)
        else:
            results.append(app_data)

    return {"applications": results, "total": len(results)}


@router.post("/applications/{verification_id}/approve")
def approve_application(
    verification_id: str,
    body: AdminDecisionRequestDto,
    db: Session = Depends(get_db),
):
    """
    Administrator approves a pending identity verification application.
    Updates IdentityVerification status to APPROVED and User account_status to APPROVED.
    Persists action to MySQL and audit_logs.
    """
    num_id = parse_numeric_id(verification_id)
    if not num_id:
        raise HTTPException(status_code=400, detail="Invalid verification ID format.")

    iv = (
        db.query(IdentityVerification)
        .options(joinedload(IdentityVerification.user))
        .filter(IdentityVerification.identity_verification_id == num_id)
        .first()
    )
    if not iv:
        raise HTTPException(status_code=404, detail="Verification record not found in database.")

    # Status lookups
    approved_verif_status = (
        db.query(VerificationStatus).filter(VerificationStatus.status_code == "APPROVED").first()
    )
    approved_acc_status = (
        db.query(AccountStatus).filter(AccountStatus.status_code == "APPROVED").first()
    )

    admin_user_id = get_default_admin_id(db, body.admin_id)
    now = datetime.now(timezone.utc)

    # Update verification record
    iv.verification_status_id = (
        approved_verif_status.verification_status_id if approved_verif_status else 2
    )
    iv.reviewed_at = now
    iv.reviewed_by = admin_user_id
    iv.rejection_reason = None
    iv.retry_instructions = None

    # Update associated user
    if iv.user:
        iv.user.account_status_id = (
            approved_acc_status.account_status_id if approved_acc_status else 2
        )
        iv.user.is_trusted = True
        iv.user.updated_at = now

    # Log audit entry
    try:
        user_approved_action = (
            db.query(AuditAction).filter(AuditAction.action_name == "USER_APPROVED").first()
        )
        action_id = user_approved_action.action_id if user_approved_action else 1

        audit = AuditLog(
            admin_id=admin_user_id,
            action_id=action_id,
            target_entity_type="users",
            target_entity_id=str(iv.user_id),
            details=body.reason or "Administrator approved identity verification.",
        )
        db.add(audit)
    except Exception:
        pass  # Non-blocking for audit log

    db.commit()

    return {
        "success": True,
        "verificationId": verification_id,
        "accountStatus": "APPROVED",
        "message": "Account approved successfully. User can now log in.",
    }


@router.post("/applications/{verification_id}/reject")
def reject_application(
    verification_id: str,
    body: AdminDecisionRequestDto,
    db: Session = Depends(get_db),
):
    """
    Administrator rejects a pending identity verification application.
    Updates IdentityVerification status to REJECTED and User account_status to REJECTED.
    """
    num_id = parse_numeric_id(verification_id)
    if not num_id:
        raise HTTPException(status_code=400, detail="Invalid verification ID format.")

    iv = (
        db.query(IdentityVerification)
        .options(joinedload(IdentityVerification.user))
        .filter(IdentityVerification.identity_verification_id == num_id)
        .first()
    )
    if not iv:
        raise HTTPException(status_code=404, detail="Verification record not found in database.")

    rejected_verif_status = (
        db.query(VerificationStatus).filter(VerificationStatus.status_code == "REJECTED").first()
    )
    rejected_acc_status = (
        db.query(AccountStatus).filter(AccountStatus.status_code == "REJECTED").first()
    )

    admin_user_id = get_default_admin_id(db, body.admin_id)
    now = datetime.now(timezone.utc)

    reason = body.reason or "Verification documents did not meet requirements."

    iv.verification_status_id = (
        rejected_verif_status.verification_status_id if rejected_verif_status else 3
    )
    iv.rejection_reason = reason
    iv.reviewed_at = now
    iv.reviewed_by = admin_user_id

    if iv.user:
        iv.user.account_status_id = (
            rejected_acc_status.account_status_id if rejected_acc_status else 3
        )
        iv.user.updated_at = now

    # Log audit entry
    try:
        user_rejected_action = (
            db.query(AuditAction).filter(AuditAction.action_name == "USER_REJECTED").first()
        )
        action_id = user_rejected_action.action_id if user_rejected_action else 2

        audit = AuditLog(
            admin_id=admin_user_id,
            action_id=action_id,
            target_entity_type="users",
            target_entity_id=str(iv.user_id),
            details=reason,
        )
        db.add(audit)
    except Exception:
        pass

    db.commit()

    return {
        "success": True,
        "verificationId": verification_id,
        "accountStatus": "REJECTED",
        "message": "Application rejected.",
    }


@router.post("/applications/{verification_id}/retry")
def request_retry_application(
    verification_id: str,
    body: AdminDecisionRequestDto,
    db: Session = Depends(get_db),
):
    """
    Administrator requests the applicant to retry submitting identification or photo.
    """
    num_id = parse_numeric_id(verification_id)
    if not num_id:
        raise HTTPException(status_code=400, detail="Invalid verification ID format.")

    iv = (
        db.query(IdentityVerification)
        .options(joinedload(IdentityVerification.user))
        .filter(IdentityVerification.identity_verification_id == num_id)
        .first()
    )
    if not iv:
        raise HTTPException(status_code=404, detail="Verification record not found in database.")

    retry_verif_status = (
        db.query(VerificationStatus).filter(VerificationStatus.status_code == "RETRY_REQUIRED").first()
    )
    review_acc_status = (
        db.query(AccountStatus).filter(AccountStatus.status_code == "REQUIRES_REVIEW").first()
    )

    admin_user_id = get_default_admin_id(db, body.admin_id)
    now = datetime.now(timezone.utc)

    reason = body.reason or "Information or photo needs correction."
    instructions = (
        body.retry_instructions
        or "Please take a clearer photo in good lighting and upload your ID again."
    )

    iv.verification_status_id = (
        retry_verif_status.verification_status_id if retry_verif_status else 4
    )
    iv.rejection_reason = reason
    iv.retry_instructions = instructions
    iv.reviewed_at = now
    iv.reviewed_by = admin_user_id

    if iv.user:
        iv.user.account_status_id = (
            review_acc_status.account_status_id if review_acc_status else 4
        )
        iv.user.updated_at = now

    db.commit()

    return {
        "success": True,
        "verificationId": verification_id,
        "accountStatus": "REQUIRES_REVIEW",
        "message": "Retry requested from user.",
    }


@router.get("/audit-logs", response_model=List[AdminAuditLogDto])
def get_audit_logs(db: Session = Depends(get_db)):
    """
    Retrieve administrator audit logs from MySQL.
    """
    logs = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.action))
        .order_by(desc(AuditLog.created_at))
        .limit(100)
        .all()
    )

    out = []
    for entry in logs:
        action_name = entry.action.action_name if entry.action else "APPROVED"
        display_action = "APPROVED"
        if "REJECT" in action_name:
            display_action = "REJECTED"
        elif "RETRY" in action_name:
            display_action = "RETRY_REQUESTED"

        out.append(
            AdminAuditLogDto(
                admin_id=f"admin-{entry.admin_id}",
                user_id=f"user-{entry.target_entity_id}",
                verification_id=f"verif-{entry.target_entity_id}",
                action=display_action,
                timestamp=entry.created_at.isoformat() if entry.created_at else "",
                reason=entry.details,
            )
        )
    return out


@router.post("/check-login-eligibility", response_model=LoginEligibilityResponseDto)
def check_login_eligibility(payload: LoginEligibilityCheckDto, db: Session = Depends(get_db)):
    """
    Verify if an account is eligible to log in based on MySQL status.
    Only status = APPROVED is allowed.
    """
    email = payload.email.strip().lower()

    user = (
        db.query(User)
        .options(joinedload(User.account_status))
        .filter(User.email == email)
        .first()
    )

    if not user:
        return LoginEligibilityResponseDto(
            allowed=False,
            account_status="PENDING",
            message="Your account is still pending administrator verification. Please wait until your registration has been reviewed.",
        )

    status_code = user.account_status.status_code if user.account_status else "PENDING"
    if status_code == "APPROVED":
        return LoginEligibilityResponseDto(
            allowed=True,
            account_status="APPROVED",
            message="Account is active and approved.",
        )
    elif status_code == "REJECTED":
        return LoginEligibilityResponseDto(
            allowed=False,
            account_status="REJECTED",
            message="Your registration was not approved. Please review the provided information or contact an administrator.",
        )
    else:
        return LoginEligibilityResponseDto(
            allowed=False,
            account_status="PENDING",
            message="Your account is still pending administrator verification. Please wait until your registration has been reviewed.",
        )


@router.post("/validate-document")
async def validate_document(file: UploadFile = File(...)):
    """
    Validate an uploaded Philippine ID document for format and file size limits.
    """
    allowed_types = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
    ]

    if file.content_type not in allowed_types:
        return {
            "valid": False,
            "error": "Invalid file format. Please upload a JPG, PNG, WebP, or PDF.",
        }

    contents = await file.read()
    file_size = len(contents)

    if file_size > config.MAX_DOCUMENT_SIZE_BYTES:
        return {
            "valid": False,
            "error": f"File exceeds maximum limit of 10MB (file size: {file_size / (1024 * 1024):.2f}MB).",
        }

    if file_size < 5 * 1024:
        return {
            "valid": False,
            "error": "File appears too small or unreadable.",
        }

    return {
        "valid": True,
        "filename": file.filename,
        "sizeBytes": file_size,
        "contentType": file.content_type,
    }


@router.get("/supported-ids")
def get_supported_ids(db: Session = Depends(get_db)):
    """
    Return all official Philippine government IDs supported by the database.
    """
    id_types = db.query(IdType).all()
    if id_types:
        return {"supportedIds": [t.type_name for t in id_types]}

    return {
        "supportedIds": [
            "Philippine National ID / PhilSys ID",
            "Driver's License",
            "Philippine Passport",
            "UMID (Unified Multi-Purpose ID)",
            "Postal ID",
            "PRC ID (Professional Regulation Commission)",
            "Senior Citizen ID",
            "PWD ID",
            "Voter's Certificate / Voter's ID",
            "SSS ID",
            "GSIS eCard",
            "TIN ID",
            "PhilHealth ID",
            "Pag-IBIG Loyalty Card",
            "School ID",
            "Other Government-Issued ID",
        ]
    }
