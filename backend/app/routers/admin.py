from datetime import datetime, timedelta
import re
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc

from app.db import get_db
from app.models.user import User, Profile, AccountStatus, Role, UserRole
from app.models.item import Item, ItemImage, ItemStatus, ItemCategory, ItemCondition, ItemType
from app.models.request import ItemRequest, RequestStatus, RequestUrgency
from app.models.moderation import Report, ReportStatus, ReportReason, ReportTargetType, AuditLog, AuditAction, UserSuspension
from app.models.notification import Notification, NotificationType

router = APIRouter(prefix="/api/admin", tags=["Admin & Moderation"])


def parse_numeric_id(val: Any) -> Optional[int]:
    if val is None:
        return None
    if isinstance(val, int):
        return val
    matches = re.findall(r"\d+", str(val))
    return int(matches[0]) if matches else None


def get_admin_id(db: Session, provided_admin_id: Optional[Any] = None) -> int:
    parsed = parse_numeric_id(provided_admin_id)
    if parsed:
        admin_user = db.query(User).filter(User.user_id == parsed).first()
        if admin_user:
            return admin_user.user_id
    admin_user = (
        db.query(User)
        .join(UserRole, UserRole.user_id == User.user_id)
        .join(Role, Role.role_id == UserRole.role_id)
        .filter(Role.role_name == "admin")
        .first()
    )
    return admin_user.user_id if admin_user else 5


# ============================================================================
# DTO Schemas
# ============================================================================

class SuspendUserRequestDto(BaseModel):
    duration: str = Field(..., description="1d, 3d, 7d, 14d, 30d, 60d, 90d, custom, permanent")
    custom_days: Optional[int] = Field(None, alias="customDays")
    reason: str = Field(...)
    message: Optional[str] = Field(None)
    admin_id: Optional[Any] = Field("user-5", alias="adminId")

    class Config:
        populate_by_name = True


class UnsuspendUserRequestDto(BaseModel):
    reason: Optional[str] = Field("Suspension lifted by administrator.")
    admin_id: Optional[Any] = Field("user-5", alias="adminId")

    class Config:
        populate_by_name = True


class RemovePostRequestDto(BaseModel):
    reason: str = Field(...)
    message: Optional[str] = Field(None)
    admin_id: Optional[Any] = Field("user-5", alias="adminId")

    class Config:
        populate_by_name = True


class RemoveRequestRequestDto(BaseModel):
    reason: str = Field(...)
    message: Optional[str] = Field(None)
    admin_id: Optional[Any] = Field("user-5", alias="adminId")

    class Config:
        populate_by_name = True


class ResolveReportRequestDto(BaseModel):
    action: str = Field(...)
    message: Optional[str] = Field(None)
    admin_id: Optional[Any] = Field("user-5", alias="adminId")

    class Config:
        populate_by_name = True


# ============================================================================
# 1. USER MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    """
    Retrieve all registered users from MySQL across ALL statuses (PENDING, APPROVED, REJECTED, SUSPENDED).
    Includes active suspension details and profile information.
    """
    users = (
        db.query(User)
        .options(
            joinedload(User.profile),
            joinedload(User.account_status),
            joinedload(User.user_roles).joinedload(UserRole.role),
        )
        .order_by(desc(User.created_at))
        .all()
    )

    now_dt = datetime.now()
    user_list = []

    for u in users:
        # Check active suspension
        active_susp = (
            db.query(UserSuspension)
            .filter(UserSuspension.user_id == u.user_id, UserSuspension.status == "ACTIVE")
            .order_by(desc(UserSuspension.suspension_id))
            .first()
        )

        is_actively_suspended = False
        suspension_data = None

        if active_susp:
            if active_susp.expires_at and active_susp.expires_at <= now_dt:
                # Auto-lift expired suspension in DB
                active_susp.status = "EXPIRED"
                u.is_suspended = False
                if u.account_status_id == 5:
                    u.account_status_id = 2  # APPROVED
                db.commit()
            else:
                is_actively_suspended = True
                suspension_data = {
                    "id": active_susp.suspension_id,
                    "reason": active_susp.reason,
                    "message": active_susp.message,
                    "startAt": active_susp.start_at.isoformat() if active_susp.start_at else None,
                    "expiresAt": active_susp.expires_at.isoformat() if active_susp.expires_at else None,
                    "isPermanent": active_susp.expires_at is None,
                    "expiresAtFormatted": active_susp.expires_at.strftime("%B %d, %Y at %I:%M %p") if active_susp.expires_at else "Permanent",
                }

        # Status code determination
        if is_actively_suspended or u.is_suspended:
            derived_status = "SUSPENDED"
        elif u.account_status:
            derived_status = u.account_status.status_code
        else:
            derived_status = "PENDING"

        # Role determination
        roles = [ur.role.role_name for ur in u.user_roles if ur.role]
        primary_role = "admin" if "admin" in roles else "user"

        prof = u.profile
        full_name = f"{prof.first_name} {prof.last_name}".strip() if prof else u.email.split("@")[0]

        user_list.append({
            "id": f"user-{u.user_id}",
            "userId": u.user_id,
            "email": u.email,
            "username": prof.username if prof else u.email.split("@")[0],
            "fullName": full_name,
            "phone": prof.phone if prof else "",
            "address": prof.address_line if prof else "",
            "barangay": prof.barangay if prof else "",
            "municipality": prof.municipality if prof else "",
            "province": prof.province if prof else "",
            "avatar": "",
            "role": primary_role,
            "status": derived_status,
            "account_status": derived_status,
            "isSuspended": is_actively_suspended or u.is_suspended,
            "suspension": suspension_data,
            "isTrusted": u.is_trusted,
            "createdAt": u.created_at.isoformat() if u.created_at else None,
            "lastActive": u.last_active_at.isoformat() if u.last_active_at else None,
        })

    return {"success": True, "count": len(user_list), "users": user_list}


@router.post("/users/{user_id}/suspend")
def suspend_user(user_id: str, dto: SuspendUserRequestDto, db: Session = Depends(get_db)):
    """
    Suspend a user account with a configured duration (1d..90d, custom days, or permanent).
    Records suspension in user_suspensions, logs in audit_logs, and creates user notification.
    """
    num_uid = parse_numeric_id(user_id)
    target_user = db.query(User).filter(User.user_id == num_uid).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    # Calculate expiration datetime
    duration_key = dto.duration.lower().strip()
    now_dt = datetime.now()
    expires_at = None
    duration_label = "Permanent"

    duration_days_map = {
        "1d": 1,
        "3d": 3,
        "7d": 7,
        "14d": 14,
        "30d": 30,
        "60d": 60,
        "90d": 90,
    }

    if duration_key in duration_days_map:
        days = duration_days_map[duration_key]
        expires_at = now_dt + timedelta(days=days)
        duration_label = f"{days} day{'s' if days > 1 else ''}"
    elif duration_key == "custom":
        if not dto.custom_days or dto.custom_days <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Custom suspension duration must be greater than 0 days.")
        if dto.custom_days > 3650:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Custom duration exceeds maximum limit (10 years).")
        expires_at = now_dt + timedelta(days=dto.custom_days)
        duration_label = f"{dto.custom_days} days"
    elif duration_key == "permanent":
        expires_at = None
        duration_label = "Permanent"
    else:
        # Default to 7 days if unrecognized
        expires_at = now_dt + timedelta(days=7)
        duration_label = "7 days"

    admin_id = get_admin_id(db, dto.admin_id)

    try:
        # 1. Supersede any existing active suspensions
        db.query(UserSuspension).filter(
            UserSuspension.user_id == target_user.user_id,
            UserSuspension.status == "ACTIVE"
        ).update({"status": "SUPERSEDED"})

        # 2. Insert new user_suspension record
        new_susp = UserSuspension(
            user_id=target_user.user_id,
            suspended_by=admin_id,
            start_at=now_dt,
            expires_at=expires_at,
            reason=dto.reason.strip(),
            message=dto.message.strip() if dto.message else None,
            status="ACTIVE"
        )
        db.add(new_susp)

        # 3. Update User entity
        target_user.is_suspended = True
        target_user.account_status_id = 5  # SUSPENDED

        # 4. Insert Audit Log
        audit = AuditLog(
            admin_id=admin_id,
            action_id=7,  # USER_SUSPENDED
            target_entity_type="user",
            target_entity_id=str(target_user.user_id),
            details=f"Suspended for {duration_label}. Reason: {dto.reason.strip()}. Admin note: {dto.message or 'None'}."
        )
        db.add(audit)

        # 5. Insert User Notification
        exp_formatted = expires_at.strftime("%B %d, %Y at %I:%M %p") if expires_at else "permanently"
        notif_msg = (
            f"Your account has been suspended until {exp_formatted}. "
            f"Reason: {dto.reason.strip()}. "
        )
        if dto.message:
            notif_msg += f"Additional note from administrator: {dto.message.strip()}"

        user_notif = Notification(
            user_id=target_user.user_id,
            notification_type_id=18,  # account_suspended
            title="Account Suspended",
            message=notif_msg,
            link="/help/community-guidelines",
            is_read=False
        )
        db.add(user_notif)

        db.commit()
        return {
            "success": True,
            "message": f"User {target_user.email} suspended successfully for {duration_label}.",
            "duration": duration_label,
            "expiresAt": expires_at.isoformat() if expires_at else None
        }
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database transaction error during suspension: {str(exc)}")


@router.post("/users/{user_id}/unsuspend")
def unsuspend_user(user_id: str, dto: Optional[UnsuspendUserRequestDto] = Body(default=None), db: Session = Depends(get_db)):
    """
    Lift user suspension. Sets status to LIFTED, updates user to APPROVED, logs action and notifies user.
    """
    if dto is None:
        dto = UnsuspendUserRequestDto()
    num_uid = parse_numeric_id(user_id)
    target_user = db.query(User).filter(User.user_id == num_uid).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    admin_id = get_admin_id(db, dto.admin_id)

    try:
        # 1. Lift active suspensions
        db.query(UserSuspension).filter(
            UserSuspension.user_id == target_user.user_id,
            UserSuspension.status == "ACTIVE"
        ).update({"status": "LIFTED"})

        # 2. Update user state
        target_user.is_suspended = False
        target_user.account_status_id = 2  # APPROVED

        # 3. Log Audit
        audit = AuditLog(
            admin_id=admin_id,
            action_id=10,  # USER_UNSUSPENDED
            target_entity_type="user",
            target_entity_id=str(target_user.user_id),
            details=f"Suspension lifted. Reason: {dto.reason or 'Administrator decision'}."
        )
        db.add(audit)

        # 4. Notify User
        user_notif = Notification(
            user_id=target_user.user_id,
            notification_type_id=19,  # account_unsuspended
            title="Account Suspension Lifted",
            message="Your account suspension has been lifted by an administrator. You can now log in and participate in community exchanges.",
            link="/dashboard",
            is_read=False
        )
        db.add(user_notif)

        db.commit()
        return {"success": True, "message": f"Suspension lifted for user {target_user.email}."}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database transaction error during unsuspension: {str(exc)}")


# ============================================================================
# 2. POST / ITEM MODERATION ENDPOINTS
# ============================================================================

@router.get("/posts")
def get_all_posts(db: Session = Depends(get_db)):
    """
    Retrieve all community listings/posts for admin moderation.
    """
    items = (
        db.query(Item)
        .options(
            joinedload(Item.owner).joinedload(User.profile),
            joinedload(Item.category),
            joinedload(Item.condition),
            joinedload(Item.item_type),
            joinedload(Item.status),
            joinedload(Item.images),
        )
        .order_by(desc(Item.created_at))
        .all()
    )

    items_out = []
    for item in items:
        owner_name = (
            f"{item.owner.profile.first_name} {item.owner.profile.last_name}".strip()
            if item.owner and item.owner.profile
            else "Community Neighbor"
        )
        items_out.append({
            "id": f"item-{item.item_id}",
            "itemId": item.item_id,
            "title": item.title,
            "description": item.description,
            "category": item.category.name if item.category else "Other",
            "condition": item.condition.condition_name if item.condition else "Good",
            "type": item.item_type.type_name if item.item_type else "donation",
            "status": item.status.status_name if item.status else "available",
            "ownerId": f"user-{item.owner_id}",
            "ownerName": owner_name,
            "createdAt": item.created_at.isoformat() if item.created_at else None,
        })

    return {"success": True, "count": len(items_out), "posts": items_out}


@router.post("/posts/{item_id}/remove")
def remove_post(item_id: str, dto: RemovePostRequestDto, db: Session = Depends(get_db)):
    """
    Soft-delete post (set status to 'removed').
    Generates audit log and user notification with reason and optional message.
    """
    num_id = parse_numeric_id(item_id)
    item = db.query(Item).filter(Item.item_id == num_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item post not found.")

    admin_id = get_admin_id(db, dto.admin_id)

    try:
        # 1. Update item status to 'removed' (status_id = 7)
        item.item_status_id = 7

        # 2. Audit Log
        audit = AuditLog(
            admin_id=admin_id,
            action_id=6,  # ITEM_REMOVED
            target_entity_type="item",
            target_entity_id=str(item.item_id),
            details=f"Removed item '{item.title}'. Reason: {dto.reason.strip()}. Admin note: {dto.message or 'None'}."
        )
        db.add(audit)

        # 3. User Notification
        notif_msg = (
            f"Your post \"{item.title}\" was removed because it violated Bayanihan Hub's community guidelines. "
            f"Reason: {dto.reason.strip()}. "
        )
        if dto.message:
            notif_msg += f"Additional message: {dto.message.strip()}. "
        notif_msg += "If you believe this was a mistake, please contact an administrator."

        notif = Notification(
            user_id=item.owner_id,
            notification_type_id=15,  # post_removed
            title="Your post has been removed",
            message=notif_msg,
            related_item_id=item.item_id,
            link="/help/community-guidelines",
            is_read=False
        )
        db.add(notif)

        db.commit()
        return {"success": True, "message": f"Post '{item.title}' removed and owner notified."}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error removing post: {str(exc)}")


# ============================================================================
# 3. REQUEST MODERATION ENDPOINTS
# ============================================================================

@router.get("/requests")
def get_all_requests(db: Session = Depends(get_db)):
    """
    Retrieve all community help requests for admin moderation.
    """
    requests = (
        db.query(ItemRequest)
        .options(
            joinedload(ItemRequest.user).joinedload(User.profile),
            joinedload(ItemRequest.category),
            joinedload(ItemRequest.urgency),
            joinedload(ItemRequest.status),
        )
        .order_by(desc(ItemRequest.created_at))
        .all()
    )

    req_out = []
    for r in requests:
        user_name = (
            f"{r.user.profile.first_name} {r.user.profile.last_name}".strip()
            if r.user and r.user.profile
            else "Community Neighbor"
        )
        req_out.append({
            "id": f"req-{r.request_id}",
            "requestId": r.request_id,
            "title": r.title,
            "description": r.description,
            "urgency": r.urgency.urgency_name if r.urgency else "medium",
            "neededBefore": r.needed_before.isoformat() if r.needed_before else "",
            "status": r.status.status_name if r.status else "active",
            "userId": f"user-{r.user_id}",
            "userName": user_name,
            "createdAt": r.created_at.isoformat() if r.created_at else None,
        })

    return {"success": True, "count": len(req_out), "requests": req_out}


@router.post("/requests/{request_id}/remove")
def remove_request(request_id: str, dto: RemoveRequestRequestDto, db: Session = Depends(get_db)):
    """
    Remove/cancel a community request with reason and user notification.
    """
    num_id = parse_numeric_id(request_id)
    req = db.query(ItemRequest).filter(ItemRequest.request_id == num_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")

    admin_id = get_admin_id(db, dto.admin_id)

    try:
        # 1. Update status to 'cancelled' (status_id = 4)
        req.request_status_id = 4

        # 2. Audit Log
        audit = AuditLog(
            admin_id=admin_id,
            action_id=9,  # REQUEST_REMOVED
            target_entity_type="request",
            target_entity_id=str(req.request_id),
            details=f"Removed request '{req.title}'. Reason: {dto.reason.strip()}. Note: {dto.message or 'None'}."
        )
        db.add(audit)

        # 3. User Notification
        notif_msg = (
            f"Your community request \"{req.title}\" was removed by an administrator. "
            f"Reason: {dto.reason.strip()}. "
        )
        if dto.message:
            notif_msg += f"Additional message: {dto.message.strip()}"

        notif = Notification(
            user_id=req.user_id,
            notification_type_id=16,  # request_removed
            title="Your request has been removed",
            message=notif_msg,
            link="/help/community-guidelines",
            is_read=False
        )
        db.add(notif)

        db.commit()
        return {"success": True, "message": f"Request '{req.title}' removed and requester notified."}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error removing request: {str(exc)}")


# ============================================================================
# 4. REPORT MODERATION ENDPOINTS
# ============================================================================

@router.get("/reports")
def get_all_reports(db: Session = Depends(get_db)):
    """
    Retrieve all community moderation reports.
    """
    reports = (
        db.query(Report)
        .options(
            joinedload(Report.reporter).joinedload(User.profile),
            joinedload(Report.target_type),
            joinedload(Report.reason),
            joinedload(Report.status),
            joinedload(Report.resolver).joinedload(User.profile),
        )
        .order_by(desc(Report.created_at))
        .all()
    )

    reports_out = []
    for rep in reports:
        reports_out.append({
            "id": f"report-{rep.report_id}",
            "reportId": rep.report_id,
            "targetType": rep.target_type.type_name if rep.target_type else "user",
            "targetId": rep.target_id,
            "reason": rep.reason.reason_code if rep.reason else "inappropriate",
            "description": rep.description,
            "status": rep.status.status_name if rep.status else "pending",
            "resolutionNote": rep.resolution_note,
            "createdAt": rep.created_at.isoformat() if rep.created_at else None,
            "resolvedAt": rep.resolved_at.isoformat() if rep.resolved_at else None,
        })

    return {"success": True, "count": len(reports_out), "reports": reports_out}


@router.post("/reports/{report_id}/resolve")
def resolve_report(report_id: str, dto: ResolveReportRequestDto, db: Session = Depends(get_db)):
    """
    Resolve a report with selected action and optional admin message.
    Notifies the affected party without exposing the reporter's identity.
    """
    num_id = parse_numeric_id(report_id)
    rep = db.query(Report).filter(Report.report_id == num_id).first()
    if not rep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    admin_id = get_admin_id(db, dto.admin_id)

    try:
        # 1. Update report status to 'resolved' (status_id = 3)
        rep.status_id = 3
        rep.resolved_by = admin_id
        rep.resolved_at = datetime.now()
        rep.resolution_note = f"Action: {dto.action.strip()}. Note: {dto.message or 'None'}."

        # 2. Audit Log
        audit = AuditLog(
            admin_id=admin_id,
            action_id=8,  # REPORT_RESOLVED
            target_entity_type="report",
            target_entity_id=str(rep.report_id),
            details=f"Resolved report on {rep.target_id}. Action: {dto.action.strip()}. Message: {dto.message or 'None'}."
        )
        db.add(audit)

        # 3. Notify affected party if appropriate (WITHOUT revealing reporter)
        target_uid = None
        target_num = parse_numeric_id(rep.target_id)

        # Target is user
        if rep.target_type_id == 1 and target_num:
            target_uid = target_num
        # Target is item -> find owner
        elif rep.target_type_id == 2 and target_num:
            item_rec = db.query(Item).filter(Item.item_id == target_num).first()
            if item_rec:
                target_uid = item_rec.owner_id

        if target_uid and dto.action.lower() not in ("no violation found", "dismissed"):
            notif_text = (
                f"An administrator reviewed activity associated with your account and applied a moderation action: {dto.action.strip()}. "
            )
            if dto.message:
                notif_text += f"Administrator message: {dto.message.strip()}"

            notif = Notification(
                user_id=target_uid,
                notification_type_id=17,  # report_resolved
                title="Moderation Review Notice",
                message=notif_text,
                link="/help/community-guidelines",
                is_read=False
            )
            db.add(notif)

        db.commit()
        return {"success": True, "message": f"Report #{rep.report_id} resolved with action '{dto.action}'."}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error resolving report: {str(exc)}")
