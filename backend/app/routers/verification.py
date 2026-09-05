from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from typing import Optional, List
from datetime import datetime, timezone
from app.schemas.verification import (
    VerificationRequestDto,
    VerificationResponseDto,
    PhilippineIdType,
    AdminDecisionRequestDto,
    AdminAuditLogDto,
    LoginEligibilityCheckDto,
    LoginEligibilityResponseDto,
)
from app.services.providers import get_verification_provider
from app.services.biometric_engine import mask_id_number
import app.config as config

router = APIRouter(prefix="/api/verification", tags=["Identity Verification"])

# In-memory storage for verification applications and admin audit logs
_APPLICATIONS_DB = []
_AUDIT_LOGS = []


@router.post("/verify", response_model=VerificationResponseDto)
async def verify_identity(dto: VerificationRequestDto):
    """
    Verify a user's identity by cross-checking their valid Philippine ID with a live facial selfie.
    CRITICAL RULE: Successful facial verification creates an application with account_status='PENDING'.
    Never automatically approve or authenticate.
    """
    try:
        provider = get_verification_provider()
        result = await provider.verify(dto)

        # Store application for administrator review
        application_record = {
            "id": result.verification_id,
            "userId": dto.user_id or f"user-{result.verification_id[-6:]}",
            "idType": dto.id_type,
            "idNumber": dto.id_number,
            "maskedIdNumber": mask_id_number(dto.id_number),
            "fullNameOnId": dto.full_name_on_id,
            "registrationFullName": dto.registration_full_name,
            "dob": dto.dob,
            "expirationDate": dto.expiration_date,
            "confidenceScore": result.confidence_score,
            "facialVerificationStatus": result.facial_verification_status,
            "idVerificationStatus": result.id_verification_status,
            "accountStatus": "PENDING",  # Always PENDING on submission
            "status": "PENDING" if result.success else result.status,
            "provider": result.provider,
            "submittedAt": datetime.now(timezone.utc).isoformat(),
            "reviewedBy": None,
            "reviewedAt": None,
            "rejectionReason": result.rejection_reason,
            "retryInstructions": result.retry_instructions,
        }

        # Upsert in application registry
        existing_idx = next(
            (i for i, r in enumerate(_APPLICATIONS_DB) if r["id"] == result.verification_id),
            None,
        )
        if existing_idx is not None:
            _APPLICATIONS_DB[existing_idx] = application_record
        else:
            _APPLICATIONS_DB.insert(0, application_record)

        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during identity verification: {str(e)}",
        )


@router.get("/applications")
async def get_applications(status: Optional[str] = Query(None)):
    """
    List all submitted identity verification applications for administrator review.
    """
    if status:
        filtered = [
            app for app in _APPLICATIONS_DB
            if app["status"].upper() == status.upper() or app["accountStatus"].upper() == status.upper()
        ]
        return {"applications": filtered, "total": len(filtered)}
    return {"applications": _APPLICATIONS_DB, "total": len(_APPLICATIONS_DB)}


@router.post("/applications/{verification_id}/approve")
async def approve_application(verification_id: str, body: AdminDecisionRequestDto):
    """
    Administrator approves a pending identity verification application.
    Changes status from PENDING -> APPROVED and logs the action.
    """
    app_record = next((r for r in _APPLICATIONS_DB if r["id"] == verification_id), None)
    now_iso = datetime.now(timezone.utc).isoformat()

    if app_record:
        app_record["accountStatus"] = "APPROVED"
        app_record["status"] = "APPROVED"
        app_record["reviewedBy"] = body.admin_id or "admin-1"
        app_record["reviewedAt"] = now_iso
        user_id = app_record["userId"]
    else:
        user_id = f"user-{verification_id}"

    # Record Admin Audit Log
    log_entry = {
        "adminId": body.admin_id or "admin-1",
        "userId": user_id,
        "verificationId": verification_id,
        "action": "APPROVED",
        "timestamp": now_iso,
        "reason": body.reason,
    }
    _AUDIT_LOGS.insert(0, log_entry)

    return {
        "success": True,
        "verificationId": verification_id,
        "accountStatus": "APPROVED",
        "message": "Account approved successfully. User can now log in.",
        "auditLog": log_entry,
    }


@router.post("/applications/{verification_id}/reject")
async def reject_application(verification_id: str, body: AdminDecisionRequestDto):
    """
    Administrator rejects a pending identity verification application.
    Changes status from PENDING -> REJECTED and logs the action with reason.
    """
    app_record = next((r for r in _APPLICATIONS_DB if r["id"] == verification_id), None)
    now_iso = datetime.now(timezone.utc).isoformat()

    if app_record:
        app_record["accountStatus"] = "REJECTED"
        app_record["status"] = "REJECTED"
        app_record["rejectionReason"] = body.reason or "Verification documents did not meet requirements."
        app_record["reviewedBy"] = body.admin_id or "admin-1"
        app_record["reviewedAt"] = now_iso
        user_id = app_record["userId"]
    else:
        user_id = f"user-{verification_id}"

    # Record Admin Audit Log
    log_entry = {
        "adminId": body.admin_id or "admin-1",
        "userId": user_id,
        "verificationId": verification_id,
        "action": "REJECTED",
        "timestamp": now_iso,
        "reason": body.reason or "Verification documents rejected by administrator.",
    }
    _AUDIT_LOGS.insert(0, log_entry)

    return {
        "success": True,
        "verificationId": verification_id,
        "accountStatus": "REJECTED",
        "message": "Application rejected.",
        "auditLog": log_entry,
    }


@router.get("/audit-logs", response_model=List[AdminAuditLogDto])
async def get_audit_logs():
    """
    Retrieve administrator audit logs for identity approval/rejection actions.
    """
    return _AUDIT_LOGS


@router.post("/check-login-eligibility", response_model=LoginEligibilityResponseDto)
async def check_login_eligibility(payload: LoginEligibilityCheckDto):
    """
    Verify if an account is eligible to log in based on its verification status.
    Only status = APPROVED is allowed.
    """
    email = payload.email.strip().lower()
    app_record = next(
        (r for r in _APPLICATIONS_DB if r.get("email", "").lower() == email or r.get("registrationFullName", "").lower() in email),
        None
    )

    if not app_record:
        # Default for unknown new applicants is PENDING
        return LoginEligibilityResponseDto(
            allowed=False,
            accountStatus="PENDING",
            message="Your account is still pending administrator verification. Please wait until your registration has been reviewed."
        )

    status = app_record["accountStatus"]
    if status == "APPROVED":
        return LoginEligibilityResponseDto(
            allowed=True,
            accountStatus="APPROVED",
            message="Account is active and approved."
        )
    elif status == "REJECTED":
        return LoginEligibilityResponseDto(
            allowed=False,
            accountStatus="REJECTED",
            message="Your registration was not approved. Please review the provided information or contact an administrator."
        )
    else:
        return LoginEligibilityResponseDto(
            allowed=False,
            accountStatus="PENDING",
            message="Your account is still pending administrator verification. Please wait until your registration has been reviewed."
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
async def get_supported_ids():
    """
    Return all official Philippine government IDs supported by the verification engine.
    """
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
