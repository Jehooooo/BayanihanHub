from datetime import datetime
import re
from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, func

from app.db import get_db
from app.models.user import User, Profile, AccountStatus, Role, UserRole
from app.models.item import Item, ItemStatus
from app.models.request import ItemRequest
from app.models.moderation import Report, ReportStatus, ReportReason, ReportTargetType, AuditLog, AuditAction
from app.models.notification import Notification, NotificationType

router = APIRouter(prefix="/api/reports", tags=["Community Reporting"])


def parse_numeric_id(val: Any) -> Optional[int]:
    if val is None:
        return None
    if isinstance(val, int):
        return val
    matches = re.findall(r"\d+", str(val))
    return int(matches[0]) if matches else None


class CreateReportRequestDto(BaseModel):
    target_type: str = Field(..., description="'item', 'user', 'request', 'message'")
    target_id: str = Field(...)
    reason: str = Field(...)
    description: Optional[str] = Field(None)
    reporter_id: Optional[Any] = Field("user-1", alias="reporterId")

    class Config:
        populate_by_name = True


@router.post("")
def submit_report(dto: CreateReportRequestDto, db: Session = Depends(get_db)):
    """
    Submits a community moderation report on an Item, User, or Community Request.
    Enforces self-reporting prevention, validation, duplicate prevention, and logs audit trail.
    """
    reporter_num = parse_numeric_id(dto.reporter_id) or 1
    target_num = parse_numeric_id(dto.target_id)

    # 1. Verify reporter exists
    reporter = db.query(User).filter(User.user_id == reporter_num).first()
    if not reporter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporter account not found.")

    target_type_str = dto.target_type.strip().lower()
    tt = db.query(ReportTargetType).filter(ReportTargetType.type_name == target_type_str).first()
    if not tt:
        # Fallback create or match
        tt = ReportTargetType(type_name=target_type_str)
        db.add(tt)
        db.flush()

    # 2. Prevent self-reporting & verify target exists
    target_title = None
    target_owner_id = None

    if target_type_str == "user":
        if target_num == reporter_num:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot report yourself.")
        reported_user = db.query(User).filter(User.user_id == target_num).first()
        if not reported_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reported user not found.")
        target_title = f"User @{reported_user.profile.username if reported_user.profile else reported_user.user_id}"
        target_owner_id = reported_user.user_id

    elif target_type_str == "item":
        item = db.query(Item).filter(Item.item_id == target_num).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reported item not found.")
        if item.owner_id == reporter_num:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot report your own post.")
        target_title = item.title
        target_owner_id = item.owner_id

    elif target_type_str == "request":
        req_item = db.query(ItemRequest).filter(ItemRequest.request_id == target_num).first()
        if not req_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reported request not found.")
        if req_item.user_id == reporter_num:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot report your own request.")
        target_title = req_item.title
        target_owner_id = req_item.user_id

    # 3. Match reason code
    reason_code_str = dto.reason.strip().lower().replace(" ", "_")
    reason_obj = db.query(ReportReason).filter(
        or_(ReportReason.reason_code == reason_code_str, ReportReason.reason_code.ilike(f"%{reason_code_str}%"))
    ).first()
    if not reason_obj:
        # Fallback to other (6) or generic
        reason_obj = db.query(ReportReason).filter(ReportReason.reason_code == "other").first()
        if not reason_obj:
            reason_obj = db.query(ReportReason).first()

    # 4. Duplicate prevention: check if this user already has an active pending report on this target
    existing_pending = (
        db.query(Report)
        .filter(
            Report.reporter_id == reporter_num,
            Report.target_type_id == tt.target_type_id,
            Report.target_id == str(dto.target_id),
            Report.status_id.in_([1, 2]),  # pending or under_review
        )
        .first()
    )
    if existing_pending:
        return {
            "success": True,
            "report_id": existing_pending.report_id,
            "message": "You already have an active report submitted for this content. Our moderation team is actively reviewing it.",
            "isDuplicate": True
        }

    # 5. Create Report record
    new_report = Report(
        reporter_id=reporter_num,
        target_type_id=tt.target_type_id,
        target_id=str(dto.target_id),
        reason_id=reason_obj.reason_id if reason_obj else 1,
        status_id=1,  # pending
        description=dto.description.strip() if dto.description else "No additional description provided by reporter.",
        created_at=datetime.now()
    )
    db.add(new_report)
    db.flush()

    # 6. Create Audit Log for report creation
    audit_action = db.query(AuditAction).filter(AuditAction.action_name == "REPORT_CREATED").first()
    if not audit_action:
        audit_action = AuditAction(action_name="REPORT_CREATED", description="User submitted a report")
        db.add(audit_action)
        db.flush()

    audit = AuditLog(
        admin_id=reporter_num,
        action_id=audit_action.action_id,
        target_entity_type=target_type_str,
        target_entity_id=str(dto.target_id),
        details=f"Report #{new_report.report_id} created for {target_type_str} {dto.target_id}. Reason: {reason_obj.reason_code if reason_obj else dto.reason}."
    )
    db.add(audit)

    # 7. Notify reporter that report was received
    notif_type = db.query(NotificationType).filter(NotificationType.type_code == "report_received").first()
    notif_type_id = notif_type.notification_type_id if notif_type else 14  # system

    reporter_notif = Notification(
        user_id=reporter_num,
        notification_type_id=notif_type_id,
        title="Report Submitted",
        message=f"Thank you for helping keep BayanihanHub safe. Your report regarding '{target_title or dto.target_id}' has been received and queued for review.",
        link="/dashboard",
        is_read=False
    )
    db.add(reporter_notif)

    db.commit()

    return {
        "success": True,
        "report_id": new_report.report_id,
        "message": "Report submitted successfully. Our administrators will review it.",
    }


@router.get("/target-status/{target_type}/{target_id}")
def get_target_report_status(target_type: str, target_id: str, db: Session = Depends(get_db)):
    """
    Returns moderation report status on a target for admin badges and indicators.
    """
    target_type_str = target_type.strip().lower()
    tt = db.query(ReportTargetType).filter(ReportTargetType.type_name == target_type_str).first()
    if not tt:
        return {"hasReports": False, "reportCount": 0, "status": "none"}

    reports = (
        db.query(Report)
        .filter(Report.target_type_id == tt.target_type_id, Report.target_id == str(target_id))
        .all()
    )

    if not reports:
        return {"hasReports": False, "reportCount": 0, "status": "none"}

    active_reports = [r for r in reports if r.status_id in [1, 2]]  # pending or under_review
    has_under_review = any(r.status_id == 2 for r in reports)
    current_status = "under_review" if has_under_review else ("pending" if active_reports else "resolved")

    return {
        "hasReports": len(reports) > 0,
        "activeReportsCount": len(active_reports),
        "totalReportsCount": len(reports),
        "status": current_status,
    }
