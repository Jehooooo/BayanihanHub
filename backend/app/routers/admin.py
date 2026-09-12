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
# 0. SYSTEM OVERVIEW STATS
# ============================================================================

@router.get("/stats")
def get_admin_system_stats(db: Session = Depends(get_db)):
    """
    Live aggregated operational statistics from MySQL database for Admin Dashboard.
    """
    from app.models.exchange import Exchange
    from app.models.verification import IdentityVerification
    
    total_users = db.query(User).count()
    total_posts = db.query(Item).filter(Item.item_status_id != 7).count()
    active_requests = db.query(ItemRequest).filter(ItemRequest.request_status_id == 1).count()
    total_exchanges = db.query(Exchange).count()
    pending_verifications = db.query(IdentityVerification).filter(IdentityVerification.verification_status_id == 1).count()

    return {
        "success": True,
        "stats": {
            "totalUsers": total_users,
            "totalPosts": total_posts,
            "activeRequests": active_requests,
            "totalExchanges": total_exchanges,
            "completedExchanges": total_exchanges,
            "pendingVerifications": pending_verifications,
        }
    }


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

    # STRICT PERMISSION GUARD: Student admins cannot suspend Jehosue's account
    if target_user.user_id == 14 or target_user.email.lower() == "jehosuebiscarra@gmail.com":
        if admin_id != 14 and admin_id != 5:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission Denied: Student admins cannot suspend Jehosue's account."
            )

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

    # STRICT PERMISSION GUARD: Student admins cannot delete or remove Jehosue's posts
    if item.owner_id == 14 or (item.owner and item.owner.email.lower() == "jehosuebiscarra@gmail.com"):
        if admin_id != 14 and admin_id != 5:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission Denied: Student admins cannot delete or remove Jehosue's posts."
            )

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

    # STRICT PERMISSION GUARD: Student admins cannot delete or remove Jehosue's requests
    if req.user_id == 14 or (req.user and req.user.email.lower() == "jehosuebiscarra@gmail.com"):
        if admin_id != 14 and admin_id != 5:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission Denied: Student admins cannot delete or remove Jehosue's requests."
            )

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
# 4. REPORT MODERATION & INVESTIGATION ENDPOINTS
# ============================================================================

def compute_severity(reason_code: str) -> str:
    r = (reason_code or "").lower()
    if any(k in r for k in ["scam", "fraud", "prohibited", "harassment", "offensive", "danger"]):
        return "high"
    if any(k in r for k in ["misleading", "fake", "inappropriate", "suspicious", "false"]):
        return "medium"
    return "low"


class UpdateReportStatusDto(BaseModel):
    status: str = Field(..., description="'pending', 'under_review', 'resolved', 'dismissed'")
    admin_id: Optional[Any] = Field("user-5", alias="adminId")

    class Config:
        populate_by_name = True


@router.get("/reports/stats")
def get_reports_stats(db: Session = Depends(get_db)):
    """
    Returns live operational statistics for moderation reports dashboard.
    """
    total = db.query(Report).count()
    pending = db.query(Report).filter(Report.status_id == 1).count()
    under_review = db.query(Report).filter(Report.status_id == 2).count()
    resolved = db.query(Report).filter(Report.status_id == 3).count()
    dismissed = db.query(Report).filter(Report.status_id == 4).count()

    # Calculate high priority / critical reports
    high_priority_reasons = db.query(ReportReason.reason_id).filter(
        or_(
            ReportReason.reason_code.ilike("%scam%"),
            ReportReason.reason_code.ilike("%prohibited%"),
            ReportReason.reason_code.ilike("%harassment%"),
            ReportReason.reason_code.ilike("%fraud%"),
        )
    ).all()
    hp_ids = [r[0] for r in high_priority_reasons]
    high_priority = (
        db.query(Report)
        .filter(Report.status_id.in_([1, 2]), Report.reason_id.in_(hp_ids))
        .count()
    )

    return {
        "success": True,
        "total": total,
        "pending": pending,
        "underReview": under_review,
        "resolved": resolved,
        "dismissed": dismissed,
        "highPriority": high_priority,
    }


@router.get("/reports")
def get_all_reports(db: Session = Depends(get_db)):
    """
    Retrieve all community moderation reports with complete investigation details,
    target object information, reporter information (admin view only), and severity.
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

    # Pre-fetch counts on targets to show '3 Reports' on active targets
    target_counts = {}
    for rep in reports:
        key = f"{rep.target_type.type_name if rep.target_type else 'user'}:{rep.target_id}"
        target_counts[key] = target_counts.get(key, 0) + 1

    reports_out = []
    for rep in reports:
        target_type_str = rep.target_type.type_name if rep.target_type else "user"
        num_target = parse_numeric_id(rep.target_id)
        reason_code = rep.reason.reason_code if rep.reason else "inappropriate"
        severity = compute_severity(reason_code)

        target_details = None
        reported_user = None

        # Load target preview
        if target_type_str == "item" and num_target:
            item_rec = (
                db.query(Item)
                .options(
                    joinedload(Item.owner).joinedload(User.profile),
                    joinedload(Item.images),
                    joinedload(Item.category),
                    joinedload(Item.condition),
                    joinedload(Item.status),
                )
                .filter(Item.item_id == num_target)
                .first()
            )
            if item_rec:
                owner_prof = item_rec.owner.profile if item_rec.owner else None
                img_url = item_rec.images[0].image_url if item_rec.images else None
                target_details = {
                    "itemId": item_rec.item_id,
                    "title": item_rec.title,
                    "description": item_rec.description,
                    "category": item_rec.category.name if item_rec.category else "Uncategorized",
                    "condition": item_rec.condition.condition_name if item_rec.condition else "Good",
                    "status": item_rec.status.status_name if item_rec.status else "active",
                    "image": img_url,
                    "ownerId": f"user-{item_rec.owner_id}",
                    "ownerName": f"{owner_prof.first_name} {owner_prof.last_name}" if owner_prof else "Unknown",
                    "ownerUsername": owner_prof.username if owner_prof else f"user_{item_rec.owner_id}",
                }
                reported_user = {
                    "id": f"user-{item_rec.owner_id}",
                    "fullName": f"{owner_prof.first_name} {owner_prof.last_name}" if owner_prof else f"User #{item_rec.owner_id}",
                    "username": owner_prof.username if owner_prof else f"user_{item_rec.owner_id}",
                    "avatar": getattr(owner_prof, "avatar_url", None),
                    "isVerified": getattr(owner_prof, "is_verified", False),
                    "rating": getattr(owner_prof, "reputation_score", 5.0),
                }

        elif target_type_str == "user" and num_target:
            usr = (
                db.query(User)
                .options(joinedload(User.profile), joinedload(User.account_status))
                .filter(User.user_id == num_target)
                .first()
            )
            if usr:
                u_prof = usr.profile
                reported_user = {
                    "id": f"user-{usr.user_id}",
                    "fullName": f"{u_prof.first_name} {u_prof.last_name}" if u_prof else f"User #{usr.user_id}",
                    "username": u_prof.username if u_prof else f"user_{usr.user_id}",
                    "avatar": getattr(u_prof, "avatar_url", None),
                    "isVerified": getattr(u_prof, "is_verified", False),
                    "rating": getattr(u_prof, "reputation_score", 5.0),
                    "status": usr.account_status.status_code if usr.account_status else "active",
                    "location": f"{u_prof.barangay or ''}, {u_prof.municipality or ''}".strip(", "),
                }
                target_details = reported_user

        elif target_type_str == "request" and num_target:
            req_item = (
                db.query(ItemRequest)
                .options(joinedload(ItemRequest.user).joinedload(User.profile), joinedload(ItemRequest.urgency))
                .filter(ItemRequest.request_id == num_target)
                .first()
            )
            if req_item:
                req_prof = req_item.user.profile if req_item.user else None
                target_details = {
                    "requestId": req_item.request_id,
                    "title": req_item.title,
                    "description": req_item.description,
                    "urgency": req_item.urgency.urgency_name if req_item.urgency else "medium",
                    "neededBefore": req_item.needed_before.isoformat() if req_item.needed_before else None,
                    "requesterId": f"user-{req_item.user_id}",
                    "requesterName": f"{req_prof.first_name} {req_prof.last_name}" if req_prof else "Neighbor",
                }
                reported_user = {
                    "id": f"user-{req_item.user_id}",
                    "fullName": f"{req_prof.first_name} {req_prof.last_name}" if req_prof else f"User #{req_item.user_id}",
                    "username": req_prof.username if req_prof else f"user_{req_item.user_id}",
                    "avatar": getattr(req_prof, "avatar_url", None),
                    "isVerified": getattr(req_prof, "is_verified", False),
                    "rating": getattr(req_prof, "reputation_score", 5.0),
                }

        # Format reporter (for authorized admin eyes only)
        reporter_prof = rep.reporter.profile if rep.reporter else None
        reporter_data = {
            "id": f"user-{rep.reporter_id}",
            "fullName": f"{reporter_prof.first_name} {reporter_prof.last_name}" if reporter_prof else f"User #{rep.reporter_id}",
            "username": reporter_prof.username if reporter_prof else f"user_{rep.reporter_id}",
            "avatar": getattr(reporter_prof, "avatar_url", None),
            "email": rep.reporter.email if rep.reporter else None,
        }

        # Status normalization
        st_name = rep.status.status_name if rep.status else "pending"
        if st_name == "reviewed":
            st_name = "under_review"

        key = f"{target_type_str}:{rep.target_id}"
        total_reports_on_target = target_counts.get(key, 1)

        reports_out.append({
            "id": f"report-{rep.report_id}",
            "reportId": rep.report_id,
            "targetType": target_type_str,
            "targetId": rep.target_id,
            "reason": reason_code,
            "severity": severity,
            "description": rep.description,
            "status": st_name,
            "reporter": reporter_data,
            "reportedUser": reported_user,
            "targetDetails": target_details,
            "targetReportsCount": total_reports_on_target,
            "resolutionNote": rep.resolution_note,
            "createdAt": rep.created_at.isoformat() if rep.created_at else None,
            "resolvedAt": rep.resolved_at.isoformat() if rep.resolved_at else None,
            "resolvedBy": f"user-{rep.resolved_by}" if rep.resolved_by else None,
        })

    return {"success": True, "count": len(reports_out), "reports": reports_out}


@router.post("/reports/{report_id}/status")
def update_report_status(report_id: str, dto: UpdateReportStatusDto, db: Session = Depends(get_db)):
    """
    Transitions a report status (e.g., to 'under_review', 'pending', 'dismissed').
    """
    num_id = parse_numeric_id(report_id)
    rep = db.query(Report).filter(Report.report_id == num_id).first()
    if not rep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    admin_id = get_admin_id(db, dto.admin_id)
    st_str = dto.status.strip().lower()

    st_id = 1
    if st_str in ["under_review", "reviewed"]:
        st_id = 2
    elif st_str == "resolved":
        st_id = 3
    elif st_str == "dismissed":
        st_id = 4

    rep.status_id = st_id
    if st_id in [3, 4]:
        rep.resolved_by = admin_id
        rep.resolved_at = datetime.now()

    # Audit log
    action_name = "REPORT_REVIEWED" if st_id == 2 else ("REPORT_DISMISSED" if st_id == 4 else "REPORT_RESOLVED")
    act_obj = db.query(AuditAction).filter(AuditAction.action_name == action_name).first()
    if act_obj:
        audit = AuditLog(
            admin_id=admin_id,
            action_id=act_obj.action_id,
            target_entity_type="report",
            target_entity_id=str(rep.report_id),
            details=f"Admin updated Report #{rep.report_id} status to '{st_str}'."
        )
        db.add(audit)

    db.commit()
    return {"success": True, "message": f"Report #{rep.report_id} status updated to '{st_str}'."}


@router.post("/reports/{report_id}/resolve")
def resolve_report(report_id: str, dto: ResolveReportRequestDto, db: Session = Depends(get_db)):
    """
    Resolve a report with selected moderation action and optional admin message.
    Executes existing BayanihanHub moderation action (removes post, issues warning,
    suspends user, removes request, or dismisses report) with audit trail and
    strictly preserves reporter privacy.
    """
    num_id = parse_numeric_id(report_id)
    rep = db.query(Report).filter(Report.report_id == num_id).first()
    if not rep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    admin_id = get_admin_id(db, dto.admin_id)
    act_lower = dto.action.strip().lower()

    try:
        # Determine target user and target item/request
        target_uid = None
        target_num = parse_numeric_id(rep.target_id)
        target_type_str = rep.target_type.type_name if rep.target_type else "user"

        if target_type_str == "user" and target_num:
            target_uid = target_num
        elif target_type_str == "item" and target_num:
            item_rec = db.query(Item).filter(Item.item_id == target_num).first()
            if item_rec:
                target_uid = item_rec.owner_id
        elif target_type_str == "request" and target_num:
            req_rec = db.query(ItemRequest).filter(ItemRequest.request_id == target_num).first()
            if req_rec:
                target_uid = req_rec.user_id

        # STRICT PERMISSION GUARD: Student admins cannot moderate Jehosue's account or posts
        if target_uid == 14 and admin_id != 14 and admin_id != 5:
            if "suspend" in act_lower:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission Denied: Student admins cannot suspend Jehosue's account."
                )
            if "post removed" in act_lower or "remove post" in act_lower or "remove" in act_lower:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission Denied: Student admins cannot delete or remove Jehosue's posts."
                )

        # 1. Execute direct Moderation Actions
        audit_action_name = "REPORT_RESOLVED"

        # Action A: Post Removed
        if "post removed" in act_lower or "remove post" in act_lower:
            if target_type_str == "item" and target_num:
                item_rec = db.query(Item).filter(Item.item_id == target_num).first()
                if item_rec:
                    item_rec.status_id = 4  # Removed / Deleted
                    item_rec.updated_at = datetime.now()
                    # Item removed audit
                    db.add(AuditLog(
                        admin_id=admin_id,
                        action_id=6,  # ITEM_REMOVED
                        target_entity_type="item",
                        target_entity_id=str(item_rec.item_id),
                        details=f"Post '{item_rec.title}' removed via report #{rep.report_id}. Reason: {dto.message or rep.description}"
                    ))
                    # Notify owner
                    if target_uid:
                        db.add(Notification(
                            user_id=target_uid,
                            notification_type_id=15,  # post_removed
                            title="Your Post Was Removed",
                            message=f"Your post '{item_rec.title}' was removed after an administrative safety review. Reason: {dto.message or 'Violation of BayanihanHub guidelines.'}",
                            link="/help/community-guidelines",
                            is_read=False
                        ))
            audit_action_name = "ITEM_REMOVED"

        # Action B: Post Restored
        elif "restore post" in act_lower or "post restored" in act_lower:
            if target_type_str == "item" and target_num:
                item_rec = db.query(Item).filter(Item.item_id == target_num).first()
                if item_rec:
                    item_rec.status_id = 1  # Active
                    item_rec.updated_at = datetime.now()
                    db.add(Notification(
                        user_id=target_uid,
                        notification_type_id=14,  # system
                        title="Your Post Was Restored",
                        message=f"Good news: Your post '{item_rec.title}' has been reviewed and restored to the community catalog.",
                        link=f"/items/{item_rec.item_id}",
                        is_read=False
                    ))

        # Action C: User Warned
        elif "warn" in act_lower or "warning" in act_lower:
            warn_act = db.query(AuditAction).filter(AuditAction.action_name == "USER_WARNED").first()
            if warn_act and target_uid:
                db.add(AuditLog(
                    admin_id=admin_id,
                    action_id=warn_act.action_id,
                    target_entity_type="user",
                    target_entity_id=str(target_uid),
                    details=f"Formal warning issued to user #{target_uid} from report #{rep.report_id}. Reason: {dto.message or rep.description}"
                ))
            if target_uid:
                db.add(Notification(
                    user_id=target_uid,
                    notification_type_id=17,  # report_resolved
                    title="Community Guidelines Warning",
                    message=f"An administrator issued a formal warning to your account: {dto.message or 'Please review our community guidelines to avoid account restrictions.'}",
                    link="/help/community-guidelines",
                    is_read=False
                ))

        # Action D: User Suspended
        elif "suspend" in act_lower:
            if target_uid:
                target_user = db.query(User).filter(User.user_id == target_uid).first()
                if target_user:
                    target_user.account_status_id = 2  # SUSPENDED
                    susp = UserSuspension(
                        user_id=target_uid,
                        suspended_by=admin_id,
                        reason=dto.message or f"Suspension applied from Report #{rep.report_id} ({rep.reason.reason_code if rep.reason else 'Violation'})",
                        message=dto.message or "Account suspended for community violations.",
                        expires_at=datetime.now() + timedelta(days=7),
                        status="ACTIVE"
                    )
                    db.add(susp)
                    db.add(AuditLog(
                        admin_id=admin_id,
                        action_id=7,  # USER_SUSPENDED
                        target_entity_type="user",
                        target_entity_id=str(target_uid),
                        details=f"User #{target_uid} suspended from report #{rep.report_id}. Message: {dto.message or 'None'}"
                    ))
                    db.add(Notification(
                        user_id=target_uid,
                        notification_type_id=18,  # account_suspended
                        title="Account Temporarily Suspended",
                        message=f"Your account has been suspended following a community report review. Reason: {dto.message or 'Policy violation.'}",
                        link="/help/support",
                        is_read=False
                    ))

        # Action E: Request Removed
        elif "request removed" in act_lower or "remove request" in act_lower:
            if target_type_str == "request" and target_num:
                req_item = db.query(ItemRequest).filter(ItemRequest.request_id == target_num).first()
                if req_item:
                    req_item.status_id = 3  # Cancelled / Removed
                    db.add(AuditLog(
                        admin_id=admin_id,
                        action_id=9,  # REQUEST_REMOVED
                        target_entity_type="request",
                        target_entity_id=str(req_item.request_id),
                        details=f"Request #{req_item.request_id} removed via report #{rep.report_id}. Reason: {dto.message or rep.description}"
                    ))
                    if target_uid:
                        db.add(Notification(
                            user_id=target_uid,
                            notification_type_id=16,  # request_removed
                            title="Community Request Removed",
                            message=f"Your request '{req_item.title}' was removed by an administrator. Reason: {dto.message or 'Violation of guidelines.'}",
                            link="/requests",
                            is_read=False
                        ))

        # 2. Update report status
        is_dismissed = any(k in act_lower for k in ["dismiss", "no violation", "not a violation", "ignore"])
        rep.status_id = 4 if is_dismissed else 3
        rep.resolved_by = admin_id
        rep.resolved_at = datetime.now()
        rep.resolution_note = f"Action: {dto.action.strip()}. Message: {dto.message or 'None'}."

        # 3. Audit Log for report resolution
        act_rec = db.query(AuditAction).filter(AuditAction.action_name == ("REPORT_DISMISSED" if is_dismissed else "REPORT_RESOLVED")).first()
        act_id = act_rec.action_id if act_rec else 8
        audit = AuditLog(
            admin_id=admin_id,
            action_id=act_id,
            target_entity_type="report",
            target_entity_id=str(rep.report_id),
            details=f"Report #{rep.report_id} on {rep.target_id} marked {('dismissed' if is_dismissed else 'resolved')}. Action: {dto.action.strip()}."
        )
        db.add(audit)

        # 4. Notify reporter (confidential confirmation)
        if rep.reporter_id:
            msg_for_reporter = (
                f"Your report regarding content '{rep.target_id}' has been reviewed by BayanihanHub administrators."
                if is_dismissed
                else f"Your report regarding content '{rep.target_id}' was reviewed and appropriate moderation action ({dto.action.strip()}) was taken. Thank you for protecting our community."
            )
            db.add(Notification(
                user_id=rep.reporter_id,
                notification_type_id=17,  # report_resolved
                title="Your Report Has Been Reviewed",
                message=msg_for_reporter,
                link="/dashboard",
                is_read=False
            ))

        db.commit()
        return {
            "success": True,
            "message": f"Report #{rep.report_id} {('dismissed' if is_dismissed else 'resolved')} with action '{dto.action}'.",
            "status": "dismissed" if is_dismissed else "resolved"
        }
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error resolving report: {str(exc)}")


@router.get("/users/{user_id}/moderation-history")
def get_user_moderation_history(user_id: str, db: Session = Depends(get_db)):
    """
    Returns moderation history (warnings, suspensions, removed posts, received reports)
    for a user, visible exclusively to authorized administrators.
    """
    num_uid = parse_numeric_id(user_id)
    target_user = db.query(User).filter(User.user_id == num_uid).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    # 1. Warnings count
    warn_act = db.query(AuditAction).filter(AuditAction.action_name == "USER_WARNED").first()
    warn_id = warn_act.action_id if warn_act else -1
    warnings_count = db.query(AuditLog).filter(
        AuditLog.action_id == warn_id,
        AuditLog.target_entity_type == "user",
        AuditLog.target_entity_id == str(num_uid)
    ).count()

    # 2. Suspensions count
    susp_count = db.query(UserSuspension).filter(UserSuspension.user_id == num_uid).count()

    # 3. Removed posts count
    user_items = db.query(Item.item_id).filter(Item.owner_id == num_uid).all()
    user_item_ids = [str(i[0]) for i in user_items]
    removed_posts_count = (
        db.query(AuditLog)
        .filter(AuditLog.action_id == 6, AuditLog.target_entity_type == "item", AuditLog.target_entity_id.in_(user_item_ids))
        .count()
        if user_item_ids else 0
    )

    # 4. Reports received count (reports against this user or their items/requests)
    reports_received_count = (
        db.query(Report)
        .filter(
            or_(
                Report.target_id == f"user-{num_uid}",
                Report.target_id == str(num_uid),
                Report.target_id.in_([f"item-{iid}" for iid in user_item_ids] + user_item_ids),
            )
        )
        .count()
    )

    # 5. Chronological audit events for this user
    relevant_logs = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.admin).joinedload(User.profile), joinedload(AuditLog.action))
        .filter(
            or_(
                (AuditLog.target_entity_type == "user") & (AuditLog.target_entity_id == str(num_uid)),
                (AuditLog.target_entity_type == "item") & (AuditLog.target_entity_id.in_(user_item_ids)),
            )
        )
        .order_by(desc(AuditLog.created_at))
        .limit(50)
        .all()
    )

    history = []
    for log in relevant_logs:
        admin_prof = log.admin.profile if log.admin else None
        history.append({
            "id": log.audit_log_id,
            "date": log.created_at.strftime("%b %d, %Y") if log.created_at else "Recent",
            "action": log.action.action_name if log.action else "MODERATION_ACTION",
            "details": log.details,
            "admin": f"{admin_prof.first_name} {admin_prof.last_name}" if admin_prof else f"Admin #{log.admin_id}",
        })

    return {
        "success": True,
        "userId": f"user-{num_uid}",
        "warnings": warnings_count,
        "suspensions": susp_count,
        "removedPosts": removed_posts_count,
        "reportsReceived": reports_received_count,
        "history": history,
    }

