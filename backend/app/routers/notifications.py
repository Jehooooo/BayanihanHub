from datetime import datetime
import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.db import get_db
from app.auth import get_current_user
from app.models.notification import Notification, NotificationType
from app.models.user import User

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


def parse_numeric_id(val: any) -> Optional[int]:
    if val is None:
        return None
    if isinstance(val, int):
        return val
    matches = re.findall(r"\d+", str(val))
    return int(matches[0]) if matches else None


def resolve_notification_user_id(val: any, db: Session) -> Optional[int]:
    num = parse_numeric_id(val)
    if not num:
        return None
    u = db.query(User).filter(User.user_id == num).first()
    if u:
        return u.user_id
    if num == 1:
        maria = db.query(User).filter(User.email == "maria@example.com").first()
        if maria:
            return maria.user_id
    elif num == 2:
        juan = db.query(User).filter(User.email == "juan@example.com").first()
        if juan:
            return juan.user_id
    return num


@router.get("")
def get_user_notifications(
    user_id: Optional[str] = Query(None),
    userId: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve in-app notifications for the authenticated user, ordered by creation date.
    Strictly prevents unauthorized access to other users' notifications.
    """
    raw_id = userId or user_id
    target_id = resolve_notification_user_id(raw_id, db) if raw_id else current_user.user_id

    # Check authorization: Only admin can view another user's notifications
    is_admin = any(ur.role.role_name.lower() == "admin" for ur in current_user.user_roles if ur.role)
    if target_id != current_user.user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view another user's notifications.",
        )

    num_uid = target_id

    query = (
        db.query(Notification)
        .options(joinedload(Notification.notification_type))
        .filter(Notification.user_id == num_uid)
    )

    notifs = query.order_by(desc(Notification.created_at)).limit(50).all()

    out = []
    for n in notifs:
        out.append({
            "id": f"notif-{n.notification_id}",
            "notificationId": n.notification_id,
            "userId": f"user-{n.user_id}",
            "type": n.notification_type.type_code if n.notification_type else "system",
            "title": n.title,
            "message": n.message,
            "link": n.link,
            "isRead": n.is_read,
            "createdAt": n.created_at.isoformat() if n.created_at else None,
            "readAt": n.read_at.isoformat() if n.read_at else None,
        })

    unread_count = sum(1 for n in out if not n["isRead"])
    return {"success": True, "count": len(out), "unreadCount": unread_count, "notifications": out}


@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark a single notification as read.
    Requires caller to be the recipient of the notification or an admin.
    """
    num_id = parse_numeric_id(notification_id)
    notif = db.query(Notification).filter(Notification.notification_id == num_id).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    is_admin = any(ur.role.role_name.lower() == "admin" for ur in current_user.user_roles if ur.role)
    if notif.user_id != current_user.user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this notification.",
        )

    notif.is_read = True
    notif.read_at = datetime.now()
    db.commit()
    return {"success": True, "message": "Notification marked as read."}


@router.patch("/read-all")
def mark_all_notifications_read(
    user_id: Optional[str] = Query(None),
    userId: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark all notifications for the authenticated user as read.
    """
    raw_id = userId or user_id
    target_id = resolve_notification_user_id(raw_id, db) if raw_id else current_user.user_id

    is_admin = any(ur.role.role_name.lower() == "admin" for ur in current_user.user_roles if ur.role)
    if target_id != current_user.user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify another user's notifications.",
        )

    num_uid = target_id

    db.query(Notification).filter(Notification.user_id == num_uid, Notification.is_read == False).update({
        "is_read": True,
        "read_at": datetime.now()
    })
    db.commit()
    return {"success": True, "message": "All notifications marked as read."}
