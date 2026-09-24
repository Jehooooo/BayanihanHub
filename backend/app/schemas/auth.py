import re
from typing import Optional, Any
from pydantic import BaseModel, Field, field_validator


class RegisterRequestDto(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
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
    website: Optional[str] = Field(None, description="Anti-bot honeypot field. Must be left empty by legitimate users.")

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one letter and at least one number or special character.")
        return v

    class Config:
        populate_by_name = True


class LoginRequestDto(BaseModel):
    email: str
    password: str


class AuthResponseDto(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    token: Optional[str] = None
    account_status: str = Field("PENDING", alias="accountStatus")
    verification_id: Optional[str] = Field(None, alias="verificationId")

    class Config:
        populate_by_name = True

class ForgotPasswordRequestDto(BaseModel):
    email: str

class ResetPasswordRequestDto(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

    @field_validator("new_password")
    @classmethod
    def validate_new_password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one letter and at least one number or special character.")
        return v

class GenericResponseDto(BaseModel):
    success: bool
    message: str
