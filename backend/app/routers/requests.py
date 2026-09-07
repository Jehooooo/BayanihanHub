from datetime import datetime, date, timedelta
import re
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc

from app.db import get_db
from app.models.user import User, Profile
from app.models.item import ItemCategory, ItemLocation
from app.models.request import ItemRequest, RequestStatus, RequestUrgency, RequestImage
from app.services.notifications import create_notification

router = APIRouter(prefix="/api/requests", tags=["Community Help Requests"])


def parse_numeric_id(val: Any) -> Optional[int]:
    if val is None:
        return None
    if isinstance(val, int):
        return val
    matches = re.findall(r"\d+", str(val))
    return int(matches[0]) if matches else None


def resolve_valid_user(user_id_val: Any, db: Session, fallback_index: int = 0) -> Optional[User]:
    num_id = parse_numeric_id(user_id_val)
    if num_id:
        u = db.query(User).filter(User.user_id == num_id).first()
        if u:
            return u
    verified_users = db.query(User).filter(User.account_status_id == 2).order_by(User.user_id).all()
    if verified_users:
        idx = min(fallback_index, len(verified_users) - 1)
        return verified_users[idx]
    return db.query(User).first()


# ============================================================================
# DTO Schemas
# ============================================================================

class CreateRequestDto(BaseModel):
    title: str = Field(..., min_length=2)
    description: str = Field(..., min_length=2)
    category: Optional[str] = "other"
    urgency: Optional[str] = "medium"  # low, medium, high, critical
    neededBefore: Optional[str] = None
    userId: Optional[Any] = None
    barangay: Optional[str] = "San Fernando"
    municipality: Optional[str] = "City of San Fernando"
    province: Optional[str] = "La Union"
    address: Optional[str] = "Barangay Area"
    images: Optional[List[str]] = []


def format_request(req: ItemRequest, db: Session) -> dict:
    u = req.user
    prof = u.profile if u else None
    user_name = (
        f"{prof.first_name} {prof.last_name}".strip()
        if prof
        else (u.email.split("@")[0] if u else "Community Neighbor")
    )

    urgency_name = req.urgency.urgency_name if req.urgency else "medium"
    status_name = req.status.status_name if req.status else "active"

    loc = req.location
    location_dict = {
        "address": loc.address_line if loc else "Barangay Area",
        "barangay": loc.barangay if loc else "San Fernando",
        "municipality": loc.municipality if loc else "City of San Fernando",
        "province": loc.province if loc else "La Union",
    }

    images = [img.image_url for img in req.images] if req.images else []

    return {
        "id": f"req-{req.request_id}",
        "requestId": req.request_id,
        "title": req.title,
        "description": req.description,
        "category": req.category.slug if req.category else "other",
        "categoryName": req.category.name if req.category else "Other Community Goods",
        "urgency": urgency_name,
        "status": status_name,
        "neededBefore": req.needed_before.isoformat() if req.needed_before else "",
        "userId": f"user-{req.user_id}",
        "user": {
            "id": f"user-{req.user_id}",
            "fullName": user_name,
            "username": prof.username if prof else (u.email.split("@")[0] if u else "neighbor"),
            "avatar": "",
            "isVerified": True,
            "role": "user",
        },
        "location": location_dict,
        "images": images,
        "responses": 1 if status_name == "in_progress" else (2 if status_name == "completed" else 0),
        "createdAt": req.created_at.isoformat() if req.created_at else datetime.now().isoformat(),
        "updatedAt": req.updated_at.isoformat() if req.updated_at else datetime.now().isoformat(),
    }


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("")
def list_requests(
    status: Optional[str] = Query(None),
    urgency: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Retrieve community help requests sorted by urgency and status.
    """
    q = (
        db.query(ItemRequest)
        .options(
            joinedload(ItemRequest.user).joinedload(User.profile),
            joinedload(ItemRequest.category),
            joinedload(ItemRequest.urgency),
            joinedload(ItemRequest.status),
            joinedload(ItemRequest.location),
            joinedload(ItemRequest.images),
        )
    )

    if status:
        q = q.join(RequestStatus, RequestStatus.request_status_id == ItemRequest.request_status_id).filter(
            RequestStatus.status_name == status.lower()
        )
    else:
        # Default: exclude cancelled
        q = q.join(RequestStatus, RequestStatus.request_status_id == ItemRequest.request_status_id).filter(
            RequestStatus.status_name != "cancelled"
        )

    if urgency and urgency != "all":
        q = q.join(RequestUrgency, RequestUrgency.urgency_id == ItemRequest.urgency_id).filter(
            RequestUrgency.urgency_name == urgency.lower()
        )

    if category and category != "all":
        q = q.join(ItemCategory, ItemCategory.category_id == ItemRequest.category_id).filter(
            or_(ItemCategory.slug == category, ItemCategory.name.ilike(f"%{category}%"))
        )

    if query:
        search_pattern = f"%{query.strip()}%"
        q = q.filter(or_(ItemRequest.title.ilike(search_pattern), ItemRequest.description.ilike(search_pattern)))

    # Order by urgency level desc, then newest
    requests = q.order_by(desc(ItemRequest.created_at)).all()
    results = [format_request(r, db) for r in requests]

    return {
        "success": True,
        "count": len(results),
        "requests": results,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_request(dto: CreateRequestDto, db: Session = Depends(get_db)):
    """
    Create a new community help request in MySQL.
    """
    user = resolve_valid_user(dto.userId, db, fallback_index=0)
    if not user:
        raise HTTPException(status_code=400, detail="Valid user account required.")
    user_id = user.user_id

    # Resolve Category
    cat_str = (dto.category or "other").strip()
    cat = db.query(ItemCategory).filter(
        or_(ItemCategory.slug == cat_str.lower(), ItemCategory.name.ilike(f"%{cat_str}%"))
    ).first()
    cat_id = cat.category_id if cat else 10

    # Resolve Urgency
    urg_str = (dto.urgency or "medium").strip().lower()
    urg = db.query(RequestUrgency).filter(RequestUrgency.urgency_name == urg_str).first()
    urg_id = urg.urgency_id if urg else 2

    # Needed Before
    needed_dt = date.today() + timedelta(days=14)
    if dto.neededBefore:
        try:
            needed_dt = datetime.strptime(dto.neededBefore.split("T")[0], "%Y-%m-%d").date()
        except Exception:
            pass

    # Location
    loc = ItemLocation(
        address_line=dto.address or "Community Area",
        barangay=dto.barangay or "San Fernando",
        municipality=dto.municipality or "City of San Fernando",
        province=dto.province or "La Union",
        latitude=16.6159,
        longitude=120.3209,
    )
    db.add(loc)
    db.flush()

    new_req = ItemRequest(
        user_id=user_id,
        category_id=cat_id,
        urgency_id=urg_id,
        request_status_id=1,  # active
        location_id=loc.location_id,
        title=dto.title.strip(),
        description=dto.description.strip(),
        needed_before=needed_dt,
    )
    db.add(new_req)
    db.flush()

    for idx, img in enumerate(dto.images or []):
        if img and str(img).strip():
            db.add(RequestImage(request_id=new_req.request_id, image_url=str(img).strip(), display_order=idx))

    db.commit()
    db.refresh(new_req)

    return {
        "success": True,
        "message": "Community assistance request created successfully.",
        "request": format_request(new_req, db),
    }


@router.post("/{request_id}/fulfill")
def fulfill_request(request_id: str, helper_id: Optional[str] = Query(None, alias="helperId"), db: Session = Depends(get_db)):
    """
    Offer assistance / mark request as in-progress or completed.
    """
    num_id = parse_numeric_id(request_id)
    req = db.query(ItemRequest).filter(ItemRequest.request_id == num_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    req.request_status_id = 3  # completed

    # Notify requester
    helper_user = resolve_valid_user(helper_id, db, fallback_index=1)
    num_helper = helper_user.user_id if helper_user else None
    helper_name = (
        f"{helper_user.profile.first_name} {helper_user.profile.last_name}".strip()
        if (helper_user and helper_user.profile)
        else "A neighbor"
    )

    create_notification(
        db=db,
        user_id=req.user_id,
        type_code="request_response",
        title="Community Assistance Fulfilled!",
        message=f"{helper_name} offered support and your request \"{req.title}\" has been fulfilled!",
        link="/requests",
        related_user_id=num_helper,
    )

    db.commit()
    db.refresh(req)
    return {"success": True, "message": "Request fulfilled successfully.", "request": format_request(req, db)}


@router.delete("/{request_id}")
def cancel_request(request_id: str, db: Session = Depends(get_db)):
    """
    Cancel community request.
    """
    num_id = parse_numeric_id(request_id)
    req = db.query(ItemRequest).filter(ItemRequest.request_id == num_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    req.request_status_id = 4  # cancelled
    db.commit()
    return {"success": True, "message": "Request cancelled."}
