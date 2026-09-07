from datetime import datetime
import re
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc

from app.db import get_db
from app.models.user import User, Profile
from app.models.item import Item, ItemStatus
from app.models.exchange import (
    Exchange,
    ExchangeStatus,
    ExchangeParticipant,
    ExchangeItem,
    ExchangeHistory,
    Rating,
)
from app.services.notifications import create_notification

router = APIRouter(prefix="/api/exchanges", tags=["Community Exchanges & Barter"])


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

class CreateExchangeDto(BaseModel):
    offeredItemId: Any = Field(...)
    requestedItemId: Any = Field(...)
    offererId: Optional[Any] = None
    receiverId: Optional[Any] = None
    message: Optional[str] = "I'd like to propose a community barter exchange!"
    meetingDate: Optional[str] = None
    meetingLocation: Optional[str] = None


class UpdateExchangeStatusDto(BaseModel):
    status: str = Field(...)  # accepted, rejected, cancelled, completed
    reason: Optional[str] = None
    meetingDate: Optional[str] = None
    meetingLocation: Optional[str] = None
    userId: Optional[Any] = None


class RateExchangeDto(BaseModel):
    raterId: Any = Field(...)
    ratedUserId: Any = Field(...)
    score: int = Field(..., ge=1, le=5)
    review: str = Field(...)


def format_exchange(exc: Exchange, db: Session) -> dict:
    offerer_part = next((p for p in exc.participants if p.participant_role == "offerer"), None)
    receiver_part = next((p for p in exc.participants if p.participant_role == "receiver"), None)

    offerer_user = offerer_part.user if offerer_part else None
    receiver_user = receiver_part.user if receiver_part else None

    # Resolve items
    offered_item_rel = next((ei for ei in exc.exchange_items if ei.role == "offered"), None)
    requested_item_rel = next((ei for ei in exc.exchange_items if ei.role == "requested"), None)

    offered_item = offered_item_rel.item if offered_item_rel else None
    requested_item = requested_item_rel.item if requested_item_rel else None

    def format_mini_user(u: Optional[User]):
        if not u:
            return None
        prof = u.profile
        name = f"{prof.first_name} {prof.last_name}".strip() if prof else u.email.split("@")[0]
        return {
            "id": f"user-{u.user_id}",
            "userId": u.user_id,
            "fullName": name,
            "email": u.email,
            "avatar": "",
            "rating": 4.9,
        }

    def format_mini_item(item: Optional[Item]):
        if not item:
            return None
        imgs = [img.image_url for img in item.images] if item.images else [
            "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&auto=format&fit=crop&q=80"
        ]
        return {
            "id": f"item-{item.item_id}",
            "itemId": item.item_id,
            "title": item.title,
            "description": item.description,
            "category": item.category.slug if item.category else "other",
            "images": imgs,
            "status": item.status.status_name if item.status else "available",
        }

    status_name = exc.status.status_name if exc.status else "pending"

    return {
        "id": f"exc-{exc.exchange_id}",
        "exchangeId": exc.exchange_id,
        "status": status_name,
        "offeredItemId": f"item-{offered_item.item_id}" if offered_item else "",
        "requestedItemId": f"item-{requested_item.item_id}" if requested_item else "",
        "offeredItem": format_mini_item(offered_item),
        "requestedItem": format_mini_item(requested_item),
        "offererId": f"user-{offerer_user.user_id}" if offerer_user else "",
        "receiverId": f"user-{receiver_user.user_id}" if receiver_user else "",
        "offerer": format_mini_user(offerer_user),
        "receiver": format_mini_user(receiver_user),
        "message": exc.message,
        "meetingDate": exc.meeting_date.isoformat() if exc.meeting_date else None,
        "meetingLocation": exc.meeting_location,
        "createdAt": exc.created_at.isoformat() if exc.created_at else datetime.now().isoformat(),
        "updatedAt": exc.updated_at.isoformat() if exc.updated_at else datetime.now().isoformat(),
        "completedAt": exc.completed_at.isoformat() if exc.completed_at else None,
    }


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("")
def get_user_exchanges(
    userId: Optional[str] = Query(None, alias="userId"),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    List exchange proposals where the user is an offerer or recipient.
    """
    q = (
        db.query(Exchange)
        .options(
            joinedload(Exchange.status),
            joinedload(Exchange.participants).joinedload(ExchangeParticipant.user).joinedload(User.profile),
            joinedload(Exchange.exchange_items).joinedload(ExchangeItem.item).joinedload(Item.images),
            joinedload(Exchange.exchange_items).joinedload(ExchangeItem.item).joinedload(Item.category),
        )
    )

    num_uid = parse_numeric_id(userId)
    if num_uid:
        q = q.join(ExchangeParticipant, ExchangeParticipant.exchange_id == Exchange.exchange_id).filter(
            ExchangeParticipant.user_id == num_uid
        )

    if status:
        q = q.join(ExchangeStatus, ExchangeStatus.exchange_status_id == Exchange.exchange_status_id).filter(
            ExchangeStatus.status_name == status.lower()
        )

    exchanges = q.order_by(desc(Exchange.created_at)).all()
    results = [format_exchange(e, db) for e in exchanges]

    return {
        "success": True,
        "count": len(results),
        "exchanges": results,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_exchange(dto: CreateExchangeDto, db: Session = Depends(get_db)):
    """
    Propose a new item barter exchange.
    """
    offered_item_id = parse_numeric_id(dto.offeredItemId)
    requested_item_id = parse_numeric_id(dto.requestedItemId)

    if not offered_item_id or not requested_item_id:
        raise HTTPException(status_code=400, detail="Both offeredItemId and requestedItemId are required.")

    req_item = db.query(Item).filter(Item.item_id == requested_item_id).first()
    if not req_item:
        raise HTTPException(status_code=404, detail="Requested item not found.")

    off_item = db.query(Item).filter(Item.item_id == offered_item_id).first()
    if not off_item:
        raise HTTPException(status_code=404, detail="Offered item not found.")

    offerer_user = resolve_valid_user(dto.offererId, db, fallback_index=0)
    receiver_user = resolve_valid_user(dto.receiverId, db, fallback_index=1)
    offerer_id = offerer_user.user_id if offerer_user else off_item.owner_id
    receiver_id = receiver_user.user_id if receiver_user else req_item.owner_id

    # 1. Create Exchange record
    new_exc = Exchange(
        exchange_status_id=1,  # pending
        message=dto.message,
        meeting_location=dto.meetingLocation,
    )
    if dto.meetingDate:
        try:
            new_exc.meeting_date = datetime.fromisoformat(dto.meetingDate)
        except Exception:
            pass

    db.add(new_exc)
    db.flush()

    # 2. Add Participants
    db.add(ExchangeParticipant(exchange_id=new_exc.exchange_id, user_id=offerer_id, participant_role="offerer"))
    db.add(ExchangeParticipant(exchange_id=new_exc.exchange_id, user_id=receiver_id, participant_role="receiver"))

    # 3. Add Exchange Items
    db.add(ExchangeItem(exchange_id=new_exc.exchange_id, item_id=offered_item_id, offered_by_user_id=offerer_id, role="offered"))
    db.add(ExchangeItem(exchange_id=new_exc.exchange_id, item_id=requested_item_id, offered_by_user_id=receiver_id, role="requested"))

    # 4. History log
    db.add(ExchangeHistory(
        exchange_id=new_exc.exchange_id,
        action="PROPOSAL_CREATED",
        performed_by=offerer_id,
        details=f"Proposed swap of '{off_item.title}' for '{req_item.title}'.",
    ))

    # 5. Notify Receiver
    offerer_user = db.query(User).filter(User.user_id == offerer_id).first()
    offerer_name = (
        f"{offerer_user.profile.first_name} {offerer_user.profile.last_name}".strip()
        if (offerer_user and offerer_user.profile)
        else "A neighbor"
    )

    create_notification(
        db=db,
        user_id=receiver_id,
        type_code="exchange_request",
        title="New Exchange Proposal Received",
        message=f"{offerer_name} offered \"{off_item.title}\" for your item \"{req_item.title}\".",
        link="/exchanges",
        related_user_id=offerer_id,
        related_item_id=req_item.item_id,
    )

    db.commit()
    db.refresh(new_exc)

    return {
        "success": True,
        "message": "Exchange proposal submitted successfully.",
        "exchange": format_exchange(new_exc, db),
    }


@router.post("/{exchange_id}/accept")
def accept_exchange(exchange_id: str, dto: Optional[UpdateExchangeStatusDto] = Body(None), db: Session = Depends(get_db)):
    """
    Accept exchange proposal. Updates status to 'accepted' and reserves both items.
    """
    num_id = parse_numeric_id(exchange_id)
    exc = db.query(Exchange).filter(Exchange.exchange_id == num_id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exchange not found.")

    exc.exchange_status_id = 2  # accepted
    if dto and dto.meetingDate:
        try:
            exc.meeting_date = datetime.fromisoformat(dto.meetingDate)
        except Exception:
            pass
    if dto and dto.meetingLocation:
        exc.meeting_location = dto.meetingLocation

    # Reserve items
    for ei in exc.exchange_items:
        it = db.query(Item).filter(Item.item_id == ei.item_id).first()
        if it:
            it.item_status_id = 2  # reserved

    # Find offerer to notify
    offerer_part = next((p for p in exc.participants if p.participant_role == "offerer"), None)
    if offerer_part:
        create_notification(
            db=db,
            user_id=offerer_part.user_id,
            type_code="exchange_accepted",
            title="Exchange Proposal Accepted!",
            message="Your trade proposal has been accepted! You can now coordinate handover details.",
            link="/exchanges",
            related_user_id=dto.userId if dto else None,
        )

    db.commit()
    db.refresh(exc)
    return {"success": True, "message": "Exchange proposal accepted.", "exchange": format_exchange(exc, db)}


@router.post("/{exchange_id}/decline")
def decline_exchange(exchange_id: str, dto: Optional[UpdateExchangeStatusDto] = Body(None), db: Session = Depends(get_db)):
    """
    Decline exchange proposal.
    """
    num_id = parse_numeric_id(exchange_id)
    exc = db.query(Exchange).filter(Exchange.exchange_id == num_id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exchange not found.")

    exc.exchange_status_id = 6  # rejected

    # Notify offerer
    offerer_part = next((p for p in exc.participants if p.participant_role == "offerer"), None)
    if offerer_part:
        reason_txt = f": \"{dto.reason}\"" if (dto and dto.reason) else "."
        create_notification(
            db=db,
            user_id=offerer_part.user_id,
            type_code="exchange_rejected",
            title="Exchange Proposal Declined",
            message=f"Your trade proposal was declined by the neighbor{reason_txt}",
            link="/exchanges",
        )

    db.commit()
    db.refresh(exc)
    return {"success": True, "message": "Exchange declined.", "exchange": format_exchange(exc, db)}


@router.post("/{exchange_id}/complete")
def complete_exchange(exchange_id: str, db: Session = Depends(get_db)):
    """
    Mark exchange completed, mark items as completed/exchanged, prompt for reviews.
    """
    num_id = parse_numeric_id(exchange_id)
    exc = db.query(Exchange).filter(Exchange.exchange_id == num_id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exchange not found.")

    exc.exchange_status_id = 4  # completed
    exc.completed_at = datetime.now()

    # Update item statuses to 3 (exchanged)
    for ei in exc.exchange_items:
        it = db.query(Item).filter(Item.item_id == ei.item_id).first()
        if it:
            it.item_status_id = 3  # exchanged

    # Notify both participants
    for p in exc.participants:
        create_notification(
            db=db,
            user_id=p.user_id,
            type_code="exchange_completed",
            title="Exchange Successfully Completed!",
            message="Your exchange has been marked complete. Please share feedback and rate your neighbor.",
            link="/exchanges",
        )

    db.commit()
    db.refresh(exc)
    return {"success": True, "message": "Exchange marked as completed.", "exchange": format_exchange(exc, db)}


@router.post("/{exchange_id}/rating")
def submit_rating(exchange_id: str, dto: RateExchangeDto, db: Session = Depends(get_db)):
    """
    Submit rating and review for an exchange partner.
    """
    num_exc = parse_numeric_id(exchange_id)
    rater = resolve_valid_user(dto.raterId, db, fallback_index=0)
    rated = resolve_valid_user(dto.ratedUserId, db, fallback_index=1)
    rater_id = rater.user_id if rater else None
    rated_id = rated.user_id if rated else None

    if not num_exc or not rater_id or not rated_id:
        raise HTTPException(status_code=400, detail="Invalid IDs provided.")

    existing_rating = db.query(Rating).filter(
        Rating.exchange_id == num_exc, Rating.rater_id == rater_id, Rating.rated_user_id == rated_id
    ).first()

    if existing_rating:
        existing_rating.score = dto.score
        existing_rating.review = dto.review.strip()
    else:
        new_rating = Rating(
            exchange_id=num_exc,
            rater_id=rater_id,
            rated_user_id=rated_id,
            score=dto.score,
            review=dto.review.strip(),
        )
        db.add(new_rating)

    db.commit()
    return {"success": True, "message": "Rating submitted successfully."}
