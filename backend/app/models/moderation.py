from typing import Optional, List
from datetime import datetime
from sqlalchemy import (
    BigInteger,
    SmallInteger,
    String,
    Text,
    DateTime,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class ReportReason(Base):
    __tablename__ = "report_reasons"

    reason_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    reason_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    reports: Mapped[List["Report"]] = relationship("Report", back_populates="reason")


class ReportStatus(Base):
    __tablename__ = "report_statuses"

    report_status_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    status_name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    reports: Mapped[List["Report"]] = relationship("Report", back_populates="status")


class ReportTargetType(Base):
    __tablename__ = "report_target_types"

    target_type_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    type_name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)

    reports: Mapped[List["Report"]] = relationship("Report", back_populates="target_type")


class Report(Base):
    __tablename__ = "reports"

    report_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    reporter_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    target_type_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("report_target_types.target_type_id"), nullable=False)
    target_id: Mapped[str] = mapped_column(String(100), nullable=False)
    reason_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("report_reasons.reason_id"), nullable=False)
    status_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("report_statuses.report_status_id"), default=1, nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    resolved_by: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True
    )
    resolution_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    reporter = relationship("app.models.user.User", foreign_keys=[reporter_id])
    resolver = relationship("app.models.user.User", foreign_keys=[resolved_by])
    target_type: Mapped["ReportTargetType"] = relationship("ReportTargetType", back_populates="reports")
    reason: Mapped["ReportReason"] = relationship("ReportReason", back_populates="reports")
    status: Mapped["ReportStatus"] = relationship("ReportStatus", back_populates="reports")


class AuditAction(Base):
    __tablename__ = "audit_actions"

    action_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    action_name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="action")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_log_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    admin_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    action_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("audit_actions.action_id"), nullable=False)
    target_entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    target_entity_id: Mapped[str] = mapped_column(String(100), nullable=False)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    admin = relationship("app.models.user.User", foreign_keys=[admin_id])
    action: Mapped["AuditAction"] = relationship("AuditAction", back_populates="logs")
