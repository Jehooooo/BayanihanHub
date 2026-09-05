from typing import Optional, Literal, List
from pydantic import BaseModel, Field

PhilippineIdType = Literal[
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

VerificationStatus = Literal["PENDING", "VERIFIED", "APPROVED", "REJECTED", "RETRY_REQUIRED"]
AccountStatus = Literal["PENDING", "APPROVED", "REJECTED", "REQUIRES_REVIEW"]
FacialVerificationStatus = Literal["PASSED", "FAILED", "NOT_STARTED"]
IdVerificationStatus = Literal["SUBMITTED", "VERIFIED", "REJECTED"]


class MatchDetailsDto(BaseModel):
    face_match: bool = Field(..., alias="faceMatch")
    name_match: bool = Field(..., alias="nameMatch")
    liveness_verified: bool = Field(..., alias="livenessVerified")

    class Config:
        populate_by_name = True


class VerificationRequestDto(BaseModel):
    user_id: Optional[str] = Field(None, alias="userId")
    id_type: PhilippineIdType = Field(..., alias="idType")
    id_number: str = Field(..., alias="idNumber")
    full_name_on_id: str = Field(..., alias="fullNameOnId")
    registration_full_name: str = Field(..., alias="registrationFullName")
    dob: str = Field(..., alias="dob")
    expiration_date: Optional[str] = Field(None, alias="expirationDate")
    extra_info: Optional[str] = Field(None, alias="extraInfo")
    id_document_base64: Optional[str] = Field(None, alias="idDocumentDataUrl")
    facial_selfie_base64: Optional[str] = Field(None, alias="facialSelfieDataUrl")

    class Config:
        populate_by_name = True


class VerificationResponseDto(BaseModel):
    verification_id: str = Field(..., alias="verificationId")
    success: bool
    status: VerificationStatus
    account_status: AccountStatus = Field("PENDING", alias="accountStatus")
    facial_verification_status: FacialVerificationStatus = Field("NOT_STARTED", alias="facialVerificationStatus")
    id_verification_status: IdVerificationStatus = Field("SUBMITTED", alias="idVerificationStatus")
    confidence_score: int = Field(..., alias="confidenceScore")
    match_details: MatchDetailsDto = Field(..., alias="matchDetails")
    rejection_reason: Optional[str] = Field(None, alias="rejectionReason")
    retry_instructions: Optional[str] = Field(None, alias="retryInstructions")
    details: str
    provider: str
    verified_at: Optional[str] = Field(None, alias="verifiedAt")

    class Config:
        populate_by_name = True


class AdminDecisionRequestDto(BaseModel):
    admin_id: Optional[str] = Field("admin-1", alias="adminId")
    reason: Optional[str] = None
    retry_instructions: Optional[str] = Field(None, alias="retryInstructions")

    class Config:
        populate_by_name = True


class AdminAuditLogDto(BaseModel):
    admin_id: str = Field(..., alias="adminId")
    user_id: str = Field(..., alias="userId")
    verification_id: str = Field(..., alias="verificationId")
    action: Literal["APPROVED", "REJECTED", "RETRY_REQUESTED"]
    timestamp: str
    reason: Optional[str] = None

    class Config:
        populate_by_name = True


class LoginEligibilityCheckDto(BaseModel):
    email: str


class LoginEligibilityResponseDto(BaseModel):
    allowed: bool
    account_status: AccountStatus = Field(..., alias="accountStatus")
    message: str

    class Config:
        populate_by_name = True
