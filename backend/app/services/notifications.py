from datetime import datetime
from typing import Optional, Any
import re
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType


def parse_numeric_id(val: Any) -> Optional[int]:
    if val is None:
        return None
    if isinstance(val, int):
        return val
    matches = re.findall(r"\d+", str(val))
    return int(matches[0]) if matches else None


def create_notification(
    db: Session,
    user_id: Any,
    type_code: str,
    title: str,
    message: str,
    link: Optional[str] = None,
    related_user_id: Optional[Any] = None,
    related_item_id: Optional[Any] = None,
) -> Optional[Notification]:
    """
    Safely insert a notification into the MySQL database.
    """
    try:
        num_user_id = parse_numeric_id(user_id)
        if not num_user_id:
            return None

        # Resolve notification_type_id
        notif_type = db.query(NotificationType).filter(NotificationType.type_code == type_code).first()
        if not notif_type:
            # Fallback to system notification or type 14
            notif_type = db.query(NotificationType).filter(NotificationType.type_code == "system").first()
            type_id = notif_type.notification_type_id if notif_type else 14
        else:
            type_id = notif_type.notification_type_id

        num_related_user = parse_numeric_id(related_user_id)
        num_related_item = parse_numeric_id(related_item_id)

        notif = Notification(
            user_id=num_user_id,
            notification_type_id=type_id,
            title=title,
            message=message,
            link=link,
            related_user_id=num_related_user,
            related_item_id=num_related_item,
            is_read=False,
            created_at=datetime.now(),
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif
    except Exception as exc:
        db.rollback()
        print(f"[WARN] Failed to create notification: {exc}")
        return None
