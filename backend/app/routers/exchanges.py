from datetime import datetime
import re
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc

from app.db import get_db
from app.auth import get_current_user
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
from app.services.reputation import check_and_award_automatic_badges
from app.services.email import EmailService

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
    ratedUserId: Optional[Any] = None
    score: int = Field(..., ge=1, le=5)
    review: Optional[str] = ""


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

    ratings_list = [
        {
            "id": str(r.rating_id),
            "raterId": f"user-{r.rater_id}",
            "ratedUserId": f"user-{r.rated_user_id}",
            "score": r.score,
            "review": r.review,
            "createdAt": r.created_at.isoformat() if r.created_at else None,
            "status": r.status,
        }
        for r in getattr(exc, "ratings", [])
        if getattr(r, "status", "active") == "active"
    ]

    return {
        "id": f"exc-{exc.exchange_id}",
        "exchangeId": exc.exchange_id,
        "status": status_name,
        "isCompleted": exc.exchange_status_id == 4,
        "completedAt": exc.completed_at.isoformat() if exc.completed_at else None,
        "offeredItemId": f"item-{offered_item.item_id}" if offered_item else "",
        "requestedItemId": f"item-{requested_item.item_id}" if requested_item else "",
        "offeredItem": format_mini_item(offered_item),
        "requestedItem": format_mini_item(requested_item),
        "offererId": f"user-{offerer_user.user_id}" if offerer_user else "",
        "receiverId": f"user-{receiver_user.user_id}" if receiver_user else "",
        "offerer": format_mini_user(offerer_user),
        "receiver": format_mini_user(receiver_user),
        "ratings": ratings_list,
        "message": exc.message,
        "meetingDate": exc.meeting_date.isoformat() if exc.meeting_date else None,
        "meetingLocation": exc.meeting_location,
        "createdAt": exc.created_at.isoformat() if exc.created_at else datetime.now().isoformat(),
        "updatedAt": exc.updated_at.isoformat() if exc.updated_at else datetime.now().isoformat(),
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
def create_exchange(
    dto: CreateExchangeDto,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Propose a new item barter exchange.
    Strictly verifies item ownership: caller must own offered item and not own requested item.
    """
    offered_item_id = parse_numeric_id(dto.offeredItemId)
    requested_item_id = parse_numeric_id(dto.requestedItemId)

    if not offered_item_id or not requested_item_id:
        raise HTTPException(status_code=400, detail="Both offeredItemId and requestedItemId are required.")

    if offered_item_id == requested_item_id:
        raise HTTPException(status_code=400, detail="You cannot exchange an item for itself.")

    req_item = db.query(Item).filter(Item.item_id == requested_item_id).first()
    if not req_item:
        raise HTTPException(status_code=404, detail="Requested item not found.")

    off_item = db.query(Item).filter(Item.item_id == offered_item_id).first()
    if not off_item:
        raise HTTPException(status_code=404, detail="Offered item not found.")

    if off_item.owner_id == req_item.owner_id:
        raise HTTPException(status_code=400, detail="You cannot propose an exchange between items belonging to the same user.")

    # Ownership validation: caller must own off_item and not own req_item
    is_admin = any(ur.role.role_name.lower() == "admin" for ur in current_user.user_roles if ur.role)
    if not is_admin and off_item.owner_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only offer items that you own.")

    if req_item.owner_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="You cannot propose an exchange for your own item.")

    offerer_id = current_user.user_id
    receiver_id = req_item.owner_id

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


@router.get("/{exchange_id}/rating-eligibility")
def get_rating_eligibility(
    exchange_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Check if current user is eligible to rate this exchange.
    Enforces completed status, legitimate participation, and one rating per deal.
    """
    num_exc = parse_numeric_id(exchange_id)
    if not num_exc:
        raise HTTPException(status_code=400, detail="Invalid exchange ID.")

    exc = (
        db.query(Exchange)
        .filter(Exchange.exchange_id == num_exc)
        .options(
            joinedload(Exchange.participants).joinedload(ExchangeParticipant.user).joinedload(User.profile),
            joinedload(Exchange.exchange_items).joinedload(ExchangeItem.item),
        )
        .first()
    )
    if not exc:
        raise HTTPException(status_code=404, detail="Exchange not found.")

    # 1. Must be completed (status 4)
    if exc.exchange_status_id != 4:
        return {
            "eligible": False,
            "reason": "This transaction has not been marked as completed yet. Only completed transactions can be rated.",
            "isCompleted": False,
            "partner": None,
            "alreadyRated": False,
        }

    # 2. Must be a participant
    caller_part = next((p for p in exc.participants if p.user_id == current_user.user_id), None)
    if not caller_part:
        return {
            "eligible": False,
            "reason": "You did not participate in this transaction.",
            "isCompleted": True,
            "partner": None,
            "alreadyRated": False,
        }

    # 3. Find the partner participant
    partner_part = next((p for p in exc.participants if p.user_id != current_user.user_id), None)
    if not partner_part or not partner_part.user:
        return {
            "eligible": False,
            "reason": "Partner user was not found for this transaction.",
            "isCompleted": True,
            "partner": None,
            "alreadyRated": False,
        }

    partner_user = partner_part.user
    partner_name = partner_user.full_name or partner_user.username
    partner_avatar = ""
    for pic in getattr(partner_user, "profile_pictures", []):
        if getattr(pic, "is_active", False) and getattr(pic, "status_id", 0) == 2:
            partner_avatar = pic.file_reference
            break

    # Get exchanged item title if any
    item_title = "Item Exchange"
    for ei in exc.exchange_items:
        if ei.item and ei.item.title:
            item_title = ei.item.title
            break

    # 4. Check if already rated by caller
    existing_rating = (
        db.query(Rating)
        .filter(
            Rating.exchange_id == num_exc,
            Rating.rater_id == current_user.user_id,
            Rating.rated_user_id == partner_user.user_id,
        )
        .first()
    )

    if existing_rating:
        return {
            "eligible": False,
            "reason": "You have already submitted your rating for this completed transaction.",
            "isCompleted": True,
            "alreadyRated": True,
            "existingRating": {
                "id": str(existing_rating.rating_id),
                "score": existing_rating.score,
                "review": existing_rating.review,
                "createdAt": existing_rating.created_at.isoformat() + "Z",
                "status": existing_rating.status,
            },
            "partner": {
                "id": f"user-{partner_user.user_id}",
                "userId": partner_user.user_id,
                "fullName": partner_name,
                "username": partner_user.username,
                "avatar": partner_avatar,
                "itemTitle": item_title,
                "completedAt": exc.completed_at.isoformat() + "Z" if exc.completed_at else exc.updated_at.isoformat() + "Z",
            },
        }

    return {
        "eligible": True,
        "reason": None,
        "isCompleted": True,
        "alreadyRated": False,
        "partner": {
            "id": f"user-{partner_user.user_id}",
            "userId": partner_user.user_id,
            "fullName": partner_name,
            "username": partner_user.username,
            "avatar": partner_avatar,
            "itemTitle": item_title,
            "completedAt": exc.completed_at.isoformat() + "Z" if exc.completed_at else exc.updated_at.isoformat() + "Z",
        },
    }


@router.post("/{exchange_id}/rating")
def submit_rating(
    exchange_id: str,
    dto: RateExchangeDto,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit rating and review for a completed exchange partner.
    Backend validates:
    - 1 <= score <= 5
    - rater_id != rated_user_id
    - transaction exists and is completed (status 4)
    - caller participated in the transaction
    - rated user is the legitimate counterparty
    - one rating per completed transaction (prevents duplicates)
    """
    num_exc = parse_numeric_id(exchange_id)
    if not num_exc:
        raise HTTPException(status_code=400, detail="Invalid exchange ID.")

    exc = db.query(Exchange).filter(Exchange.exchange_id == num_exc).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    # 1. Enforce completed status
    if exc.exchange_status_id != 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only completed transactions can be rated. This transaction is not completed.",
        )

    # 2. Verify caller is a legitimate participant
    caller_part = db.query(ExchangeParticipant).filter(
        ExchangeParticipant.exchange_id == num_exc,
        ExchangeParticipant.user_id == current_user.user_id,
    ).first()
    if not caller_part:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only rate transactions you participated in.",
        )

    # 3. Resolve the counterparty partner
    partner_part = db.query(ExchangeParticipant).filter(
        ExchangeParticipant.exchange_id == num_exc,
        ExchangeParticipant.user_id != current_user.user_id,
    ).first()
    if not partner_part:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No partner found for this transaction to rate.",
        )

    rated_user_id = partner_part.user_id

    # If explicit ratedUserId was provided, verify match
    if dto.ratedUserId:
        explicit_num = parse_numeric_id(dto.ratedUserId)
        if explicit_num and explicit_num != rated_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specified rated user does not match the actual transaction partner.",
            )

    # 4. Prevent self-rating
    if current_user.user_id == rated_user_id:
        raise HTTPException(status_code=400, detail="You cannot rate yourself.")

    # 5. Prevent duplicate ratings for the same completed interaction
    existing_rating = db.query(Rating).filter(
        Rating.exchange_id == num_exc,
        Rating.rater_id == current_user.user_id,
        Rating.rated_user_id == rated_user_id,
    ).first()
    if existing_rating:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted a rating for this completed transaction.",
        )

    # 6. Save valid rating
    cleaned_review = (dto.review or "").strip() or None
    new_rating = Rating(
        exchange_id=num_exc,
        rater_id=current_user.user_id,
        rated_user_id=rated_user_id,
        score=dto.score,
        review=cleaned_review,
        status="active",
    )
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)

    # 7. Check and award automatic badges
    try:
        check_and_award_automatic_badges(db, rated_user_id)
    except Exception as e:
        print(f"[WARNING] Automatic badge evaluation error: {e}")

    # 8. Create in-app notification for the rated partner
    rater_name = current_user.full_name or current_user.username
    try:
        create_notification(
            db=db,
            user_id=rated_user_id,
            type_code="new_rating",
            title="New Rating Received!",
            message=f"You received a new {dto.score}-star rating from {rater_name}.",
            link="/profile",
            related_user_id=current_user.user_id,
        )
    except Exception as e:
        print(f"[WARNING] Notification creation failed: {e}")

    # 9. Send email notification if user has an email
    try:
        rated_user = db.query(User).filter(User.user_id == rated_user_id).first()
        if rated_user and rated_user.email:
            recipient_name = rated_user.full_name or rated_user.username
            EmailService.send_new_rating_email(
                to_email=rated_user.email,
                recipient_name=recipient_name,
                rater_name=rater_name,
                score=dto.score,
                review=cleaned_review,
            )
    except Exception as e:
        print(f"[WARNING] Rating email delivery failed: {e}")

    return {
        "success": True,
        "message": "Rating submitted successfully.",
        "rating": {
            "id": str(new_rating.rating_id),
            "exchangeId": str(new_rating.exchange_id),
            "score": new_rating.score,
            "review": new_rating.review,
            "createdAt": new_rating.created_at.isoformat() + "Z",
        },
    }

