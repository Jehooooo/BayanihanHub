from datetime import datetime
import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.db import get_db
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
    # Check if user exists directly
    u = db.query(User).filter(User.user_id == num).first()
    if u:
        return u.user_id
    # Demo/mock mapping:
    # 1 -> maria@example.com (user 6)
    # 2 -> juan@example.com (user 7)
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
    db: Session = Depends(get_db),
):
    """
    Retrieve in-app notifications for a specific user, ordered by creation date.
    Never returns other users' notifications.
    """
    raw_id = userId or user_id
    if not raw_id:
        return {"success": True, "count": 0, "unreadCount": 0, "notifications": []}

    num_uid = resolve_notification_user_id(raw_id, db)
    if not num_uid:
        return {"success": True, "count": 0, "unreadCount": 0, "notifications": []}

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
def mark_notification_as_read(notification_id: str, db: Session = Depends(get_db)):
    """
    Mark a single notification as read.
    """
    num_id = parse_numeric_id(notification_id)
    notif = db.query(Notification).filter(Notification.notification_id == num_id).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notif.is_read = True
    notif.read_at = datetime.now()
    db.commit()
    return {"success": True, "message": "Notification marked as read."}


@router.patch("/read-all")
def mark_all_notifications_read(
    user_id: Optional[str] = Query(None),
    userId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Mark all notifications for a user as read.
    """
    raw_id = userId or user_id
    num_uid = resolve_notification_user_id(raw_id, db)
    if not num_uid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing user_id parameter.")

    db.query(Notification).filter(Notification.user_id == num_uid, Notification.is_read == False).update({
        "is_read": True,
        "read_at": datetime.now()
    })
    db.commit()
    return {"success": True, "message": "All notifications marked as read."}
