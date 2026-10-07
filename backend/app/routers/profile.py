from datetime import datetime
import re
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.db import get_db
from app.auth import get_current_user, get_current_user_optional, get_current_admin
from app.models.user import User, Profile, ProfilePicture, ProfilePictureStatus, UserBadge, Badge, NotificationPreference
from app.models.exchange import Rating
from app.services.notifications import create_notification
from app.services.reputation import calculate_user_reputation_stats

router = APIRouter(prefix="/api", tags=["User Profile & Avatar Moderation"])



def parse_numeric_id(val: Any) -> Optional[int]:
    if val is None:
        return None
    if isinstance(val, int):
        return val
    matches = re.findall(r"\d+", str(val))
    return int(matches[0]) if matches else None


# ============================================================================
# DTO Schemas
# ============================================================================

class UpdateProfileDto(BaseModel):
    userId: Any = Field(...)
    fullName: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    barangay: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None


class AvatarUploadDto(BaseModel):
    userId: Any = Field(...)
    imageUrl: str = Field(...)


class AvatarReviewDto(BaseModel):
    adminId: Optional[Any] = "user-5"
    reason: Optional[str] = "Did not meet community photo guidelines."


class NotificationPreferenceDto(BaseModel):
    emailMessages: bool
    emailDonationUpdates: bool
    emailExchangeUpdates: bool
    emailAccountSecurity: bool


def format_user_profile(user: User, db: Optional[Session] = None) -> dict:
    prof = user.profile
    full_name = f"{prof.first_name} {prof.last_name}".strip() if prof else user.email.split("@")[0]

    # Find active approved avatar
    active_pic = next((p for p in user.profile_pictures if p.is_active and p.status_id == 2), None)
    pending_pic = next((p for p in user.profile_pictures if p.status_id == 1), None)

    avatar_url = active_pic.file_reference if active_pic else ""
    pending_avatar_url = pending_pic.file_reference if pending_pic else None

    # Filter only active badges
    active_user_badges = [
        b for b in user.badges
        if b.badge and getattr(b, "status", "active") == "active"
    ]
    badge_names = [b.badge.name for b in active_user_badges] if active_user_badges else ["Verified Neighbor"]
    badge_objects = [
        {
            "id": b.badge.badge_id,
            "name": b.badge.name,
            "code": b.badge.badge_code,
            "icon": b.badge.icon,
            "description": b.badge.description,
            "earnedAt": b.earned_at.isoformat() if b.earned_at else None,
            "reason": b.reason,
        }
        for b in active_user_badges
    ]

    # Dynamic rating calculation
    rating = None
    review_count = 0
    reputation_level = "New Member"
    completed_deals = 0

    if db:
        stats = calculate_user_reputation_stats(db, user.user_id)
        rating = stats["averageRating"]
        review_count = stats["totalRatings"]
        reputation_level = stats["reputationLevel"]
        completed_deals = stats["completedDeals"]

    return {
        "id": f"user-{user.user_id}",
        "userId": user.user_id,
        "email": user.email,
        "username": prof.username if prof else user.email.split("@")[0],
        "fullName": full_name,
        "bio": prof.bio if prof else "",
        "phone": prof.phone if prof else "",
        "address": prof.address_line if prof else "",
        "barangay": prof.barangay if prof else "San Fernando",
        "municipality": prof.municipality if prof else "City of San Fernando",
        "province": prof.province if prof else "La Union",
        "avatar": avatar_url,
        "pendingAvatar": pending_avatar_url,
        "avatarStatus": "pending" if pending_pic else ("approved" if active_pic else "none"),
        "badges": badge_names,
        "badgeDetails": badge_objects,
        "isVerified": user.account_status_id == 2,
        "accountStatus": user.account_status.status_code if user.account_status else "PENDING",
        "rating": rating,
        "reviewCount": review_count,
        "reputationLevel": reputation_level,
        "completedDeals": completed_deals,
        "joinedDate": user.created_at.strftime("%B %Y") if user.created_at else "August 2026",
    }


# ============================================================================
# USER PROFILE ENDPOINTS
# ============================================================================

@router.get("/users/profile/{user_id}")
def get_profile(user_id: str, db: Session = Depends(get_db)):
    """
    Fetch user profile details and active avatar.
    """
    num_uid = parse_numeric_id(user_id)
    if not num_uid:
        raise HTTPException(status_code=400, detail="Invalid user ID.")

    user = (
        db.query(User)
        .filter(User.user_id == num_uid)
        .options(
            joinedload(User.profile),
            joinedload(User.account_status),
            joinedload(User.profile_pictures),
            joinedload(User.badges).joinedload(UserBadge.badge),
        )
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return {"success": True, "profile": format_user_profile(user, db)}


@router.get("/users/profile/{user_id}/reputation")
def get_user_reputation(user_id: str, db: Session = Depends(get_db)):
    """
    Fetch comprehensive reputation summary:
    - Dynamic average rating and count
    - 5-star distribution breakdown (1-5 stars)
    - Active earned and awarded badges
    - List of valid public reviews with rater info
    - Reputation tier
    """
    num_uid = parse_numeric_id(user_id)
    if not num_uid:
        raise HTTPException(status_code=400, detail="Invalid user ID.")

    user = (
        db.query(User)
        .filter(User.user_id == num_uid)
        .options(
            joinedload(User.profile),
            joinedload(User.badges).joinedload(UserBadge.badge),
        )
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    stats = calculate_user_reputation_stats(db, num_uid)

    # Active badges
    active_badges = [
        {
            "id": b.badge.badge_id,
            "code": b.badge.badge_code,
            "name": b.badge.name,
            "icon": b.badge.icon,
            "description": b.badge.description,
            "earnedAt": b.earned_at.isoformat() if b.earned_at else None,
            "reason": b.reason,
            "isAwardedByAdmin": b.awarded_by is not None,
        }
        for b in user.badges
        if b.badge and getattr(b, "status", "active") == "active"
    ]

    # Valid reviews received (status == 'active')
    ratings = (
        db.query(Rating)
        .filter(Rating.rated_user_id == num_uid, Rating.status == "active")
        .options(
            joinedload(Rating.rater).joinedload(User.profile),
            joinedload(Rating.rater).joinedload(User.profile_pictures),
        )
        .order_by(desc(Rating.created_at))
        .all()
    )

    reviews_list = []
    for r in ratings:
        rater = r.rater
        rater_avatar = ""
        if rater:
            for pic in getattr(rater, "profile_pictures", []):
                if getattr(pic, "is_active", False) and getattr(pic, "status_id", 0) == 2:
                    rater_avatar = pic.file_reference
                    break

        reviews_list.append({
            "id": str(r.rating_id),
            "exchangeId": str(r.exchange_id),
            "score": r.score,
            "review": r.review,
            "createdAt": r.created_at.isoformat() + "Z",
            "rater": {
                "id": f"user-{rater.user_id}" if rater else "",
                "fullName": rater.full_name if rater else "Community Neighbor",
                "username": rater.username if rater else "neighbor",
                "avatar": rater_avatar,
            },
        })

    return {
        "success": True,
        "userId": num_uid,
        "fullName": user.full_name,
        "username": user.username,
        "averageRating": stats["averageRating"],
        "totalRatings": stats["totalRatings"],
        "distribution": stats["distribution"],
        "completedDeals": stats["completedDeals"],
        "reputationLevel": stats["reputationLevel"],
        "bayesianScore": stats["bayesianScore"],
        "badges": active_badges,
        "reviews": reviews_list,
    }



@router.put("/users/profile")
def update_profile(
    dto: UpdateProfileDto,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update personal bio, phone, and address in MySQL.
    Enforces record ownership: a user can only modify their own profile.
    """
    num_uid = parse_numeric_id(dto.userId)
    if not num_uid:
        raise HTTPException(status_code=400, detail="Valid userId is required.")

    is_admin = any(ur.role.role_name.lower() == "admin" for ur in current_user.user_roles if ur.role)
    if not is_admin and current_user.user_id != num_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit another user's profile.",
        )

    user = db.query(User).filter(User.user_id == num_uid).options(joinedload(User.profile)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    prof = user.profile
    if not prof:
        prof = Profile(
            user_id=num_uid,
            username=user.email.split("@")[0],
            first_name="Neighbor",
            last_name="",
            phone=dto.phone or "",
            address_line=dto.address or "",
            barangay=dto.barangay or "San Fernando",
            municipality=dto.municipality or "City of San Fernando",
            province=dto.province or "La Union",
        )
        db.add(prof)
        db.flush()

    if dto.fullName:
        parts = dto.fullName.strip().split()
        prof.first_name = parts[0]
        prof.last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
    if dto.bio is not None:
        prof.bio = dto.bio.strip()
    if dto.phone:
        prof.phone = dto.phone.strip()
    if dto.address:
        prof.address_line = dto.address.strip()
    if dto.barangay:
        prof.barangay = dto.barangay.strip()
    if dto.municipality:
        prof.municipality = dto.municipality.strip()
    if dto.province:
        prof.province = dto.province.strip()

    db.commit()
    db.refresh(user)
    return {"success": True, "message": "Profile updated successfully.", "profile": format_user_profile(user)}


@router.get("/users/{user_id}/notification-preferences")
def get_notification_preferences(user_id: str, db: Session = Depends(get_db)):
    """
    Fetch user notification preferences.
    """
    num_uid = parse_numeric_id(user_id)
    if not num_uid:
        raise HTTPException(status_code=400, detail="Invalid user ID.")
        
    user = db.query(User).filter(User.user_id == num_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    prefs = db.query(NotificationPreference).filter(NotificationPreference.user_id == num_uid).first()
    if not prefs:
        prefs = NotificationPreference(
            user_id=num_uid,
            email_messages=True,
            email_donation_updates=True,
            email_exchange_updates=True,
            email_account_security=True
        )
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
        
    return {
        "success": True,
        "preferences": {
            "emailMessages": prefs.email_messages,
            "emailDonationUpdates": prefs.email_donation_updates,
            "emailExchangeUpdates": prefs.email_exchange_updates,
            "emailAccountSecurity": prefs.email_account_security
        }
    }


@router.put("/users/{user_id}/notification-preferences")
def update_notification_preferences(
    user_id: str,
    dto: NotificationPreferenceDto,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update user notification preferences. Enforces user record ownership.
    """
    num_uid = parse_numeric_id(user_id)
    if not num_uid:
        raise HTTPException(status_code=400, detail="Invalid user ID.")

    is_admin = any(ur.role.role_name.lower() == "admin" for ur in current_user.user_roles if ur.role)
    if not is_admin and current_user.user_id != num_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify another user's preferences.",
        )
        
    user = db.query(User).filter(User.user_id == num_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    prefs = db.query(NotificationPreference).filter(NotificationPreference.user_id == num_uid).first()
    if not prefs:
        prefs = NotificationPreference(
            user_id=num_uid,
            email_messages=dto.emailMessages,
            email_donation_updates=dto.emailDonationUpdates,
            email_exchange_updates=dto.emailExchangeUpdates,
            email_account_security=dto.emailAccountSecurity
        )
        db.add(prefs)
    else:
        prefs.email_messages = dto.emailMessages
        prefs.email_donation_updates = dto.emailDonationUpdates
        prefs.email_exchange_updates = dto.emailExchangeUpdates
        prefs.email_account_security = dto.emailAccountSecurity
        
    db.commit()
    
    return {
        "success": True,
        "message": "Notification preferences updated successfully.",
        "preferences": {
            "emailMessages": prefs.email_messages,
            "emailDonationUpdates": prefs.email_donation_updates,
            "emailExchangeUpdates": prefs.email_exchange_updates,
            "emailAccountSecurity": prefs.email_account_security
        }
    }


@router.post("/users/profile/avatar")
def submit_avatar(
    dto: AvatarUploadDto,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a new profile picture. Enforces safety policy: avatar is saved as 'pending'
    and requires administrator approval before becoming active.
    """
    num_uid = parse_numeric_id(dto.userId)
    if not num_uid:
        raise HTTPException(status_code=400, detail="Invalid user ID.")

    is_admin = any(ur.role.role_name.lower() == "admin" for ur in current_user.user_roles if ur.role)
    if not is_admin and current_user.user_id != num_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to upload avatars for another user.",
        )

    user = db.query(User).filter(User.user_id == num_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Supersede or replace any existing pending submissions
    db.query(ProfilePicture).filter(
        ProfilePicture.user_id == num_uid, ProfilePicture.status_id == 1
    ).update({"status_id": 3, "rejection_reason": "Superseded by newer upload"})

    new_pic = ProfilePicture(
        user_id=num_uid,
        file_reference=dto.imageUrl,
        status_id=1,  # pending
        is_active=False,
    )
    db.add(new_pic)
    db.commit()
    db.refresh(new_pic)

    return {
        "success": True,
        "message": "Profile picture submitted for administrator review.",
        "avatarId": new_pic.profile_picture_id,
        "status": "pending",
        "imageUrl": new_pic.file_reference,
    }


# ============================================================================
# ADMIN AVATAR REVIEW ENDPOINTS
# ============================================================================

@router.get("/admin/avatars")
def get_pending_avatars(db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin)):
    """
    Administrator endpoint to review avatar submissions.
    """
    submissions = (
        db.query(ProfilePicture)
        .options(joinedload(ProfilePicture.user).joinedload(User.profile), joinedload(ProfilePicture.status))
        .order_by(desc(ProfilePicture.submitted_at))
        .all()
    )

    out = []
    for sub in submissions:
        u = sub.user
        prof = u.profile if u else None
        name = f"{prof.first_name} {prof.last_name}".strip() if prof else (u.email.split("@")[0] if u else "User")
        status_str = sub.status.status_code if sub.status else "pending"

        out.append({
            "id": f"sub-{sub.profile_picture_id}",
            "submissionId": sub.profile_picture_id,
            "userId": f"user-{sub.user_id}",
            "user": {
                "id": f"user-{sub.user_id}",
                "fullName": name,
                "email": u.email if u else "",
            },
            "imageUrl": sub.file_reference,
            "status": status_str,
            "isActive": sub.is_active,
            "rejectionReason": sub.rejection_reason,
            "submittedAt": sub.submitted_at.isoformat() if sub.submitted_at else None,
            "reviewedAt": sub.reviewed_at.isoformat() if sub.reviewed_at else None,
        })

    pending_count = sum(1 for s in out if s["status"] == "pending")
    return {"success": True, "count": len(out), "pendingCount": pending_count, "submissions": out}


@router.post("/admin/avatars/{avatar_id}/approve")
def approve_avatar(avatar_id: str, db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin)):
    """
    Approve an avatar photo. Deactivates previous avatars for this user and activates new one.
    """
    num_id = parse_numeric_id(avatar_id)
    pic = db.query(ProfilePicture).filter(ProfilePicture.profile_picture_id == num_id).first()
    if not pic:
        raise HTTPException(status_code=404, detail="Avatar submission not found.")

    # Deactivate previous avatars
    db.query(ProfilePicture).filter(
        ProfilePicture.user_id == pic.user_id, ProfilePicture.profile_picture_id != pic.profile_picture_id
    ).update({"is_active": False})

    pic.status_id = 2  # approved
    pic.is_active = True
    pic.reviewed_at = datetime.now()

    # Create notification for user
    create_notification(
        db=db,
        user_id=pic.user_id,
        type_code="profile_picture_approved",
        title="Profile Picture Approved!",
        message="Your profile picture was approved by an administrator and is now active across Bayanihan Hub!",
        link="/profile",
    )

    db.commit()
    return {"success": True, "message": "Profile picture approved and activated."}


@router.post("/admin/avatars/{avatar_id}/reject")
def reject_avatar(avatar_id: str, dto: Optional[AvatarReviewDto] = Body(None), db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin)):
    """
    Reject an avatar photo submission with reason.
    """
    num_id = parse_numeric_id(avatar_id)
    pic = db.query(ProfilePicture).filter(ProfilePicture.profile_picture_id == num_id).first()
    if not pic:
        raise HTTPException(status_code=404, detail="Avatar submission not found.")

    reason = (dto.reason if dto else None) or "Did not meet community photo guidelines."
    pic.status_id = 3  # rejected
    pic.is_active = False
    pic.rejection_reason = reason
    pic.reviewed_at = datetime.now()

    # Create notification for user
    create_notification(
        db=db,
        user_id=pic.user_id,
        type_code="profile_picture_rejected",
        title="Profile Picture Declined",
        message=f"Your profile picture submission was declined: \"{reason}\". Please upload a compliant photo.",
        link="/profile",
    )

    db.commit()
    return {"success": True, "message": "Profile picture rejected and user notified."}
