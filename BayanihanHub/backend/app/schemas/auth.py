from typing import Optional, Any
from pydantic import BaseModel, Field


class RegisterRequestDto(BaseModel):
    email: str
    password: str
    username: str
    full_name: str = Field(..., alias="fullName")
    phone: Optional[str] = ""
    address: Optional[str] = ""
    barangay: Optional[str] = ""
    municipality: Optional[str] = ""
    province: Optional[str] = ""
    id_type: Optional[str] = Field(None, alias="idType")
    id_number: Optional[str] = Field(None, alias="idNumber")
    full_name_on_id: Optional[str] = Field(None, alias="fullNameOnId")
    dob: Optional[str] = None
    expiration_date: Optional[str] = Field(None, alias="expirationDate")
    extra_info: Optional[str] = Field(None, alias="extraInfo")
    id_document_url: Optional[str] = Field(None, alias="idDocumentUrl")
    face_image_url: Optional[str] = Field(None, alias="faceImageUrl")
    verification_confidence: Optional[int] = Field(95, alias="verificationConfidence")

    class Config:
        populate_by_name = True


class LoginRequestDto(BaseModel):
    email: str
    password: str


class AuthResponseDto(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    account_status: str = Field("PENDING", alias="accountStatus")
    verification_id: Optional[str] = Field(None, alias="verificationId")

    class Config:
        populate_by_name = True
