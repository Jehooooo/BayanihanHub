from typing import Optional
from datetime import datetime, date
from sqlalchemy import (
    BigInteger,
    SmallInteger,
    String,
    Boolean,
    Text,
    Date,
    DateTime,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class IdType(Base):
    __tablename__ = "id_types"

    id_type_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    type_name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    number_label: Mapped[str] = mapped_column(String(100), nullable=False)
    format_placeholder: Mapped[str] = mapped_column(String(64), nullable=False)
    format_hint: Mapped[str] = mapped_column(String(150), nullable=False)
    requires_expiration: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    extra_field_label: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    extra_field_placeholder: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    help_text: Mapped[str] = mapped_column(String(255), nullable=False)

    verifications: Mapped[list["IdentityVerification"]] = relationship("IdentityVerification", back_populates="id_type")


class FacialVerificationStatus(Base):
    __tablename__ = "facial_verification_statuses"

    status_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    status_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    verifications: Mapped[list["IdentityVerification"]] = relationship(
        "IdentityVerification", back_populates="facial_status"
    )


class VerificationStatus(Base):
    __tablename__ = "verification_statuses"

    verification_status_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    status_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    verifications: Mapped[list["IdentityVerification"]] = relationship(
        "IdentityVerification", back_populates="verification_status"
    )


class IdentityVerification(Base):
    __tablename__ = "identity_verifications"

    identity_verification_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    id_type_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("id_types.id_type_id"), nullable=False)
    id_number: Mapped[str] = mapped_column(String(120), nullable=False)
    masked_id_number: Mapped[str] = mapped_column(String(64), nullable=False)
    full_name_on_id: Mapped[str] = mapped_column(String(200), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    expiration_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    extra_info: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    document_reference: Mapped[str] = mapped_column(String(500), nullable=False)
    facial_selfie_reference: Mapped[str] = mapped_column(String(500), nullable=False)
    facial_verification_status_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("facial_verification_statuses.status_id"), nullable=False, default=1
    )
    verification_status_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("verification_statuses.verification_status_id"), nullable=False, default=1
    )
    confidence_score: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    provider: Mapped[str] = mapped_column(String(64), nullable=False, default="BayanihanHub-Biometric-Engine")
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    reviewed_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)

    user = relationship("app.models.user.User", foreign_keys=[user_id])
    reviewer = relationship("app.models.user.User", foreign_keys=[reviewed_by])
    id_type: Mapped["IdType"] = relationship("IdType", back_populates="verifications")
    facial_status: Mapped["FacialVerificationStatus"] = relationship("FacialVerificationStatus", back_populates="verifications")
    verification_status: Mapped["VerificationStatus"] = relationship("VerificationStatus", back_populates="verifications")
