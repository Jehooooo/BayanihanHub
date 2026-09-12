from datetime import datetime
import re
import os
import uuid
import base64
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body, UploadFile, File
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc

from app.db import get_db
from app.models.user import User, Profile
from app.models.item import (
    Item,
    ItemImage,
    ItemCategory,
    ItemCondition,
    ItemType,
    ItemStatus,
    ItemLocation,
    ItemPickupOption,
    SavedItem,
)
from app.models.messaging import (
    Conversation,
    ConversationParticipant,
    Message,
    MessageType,
)
from app.services.notifications import create_notification
from app.services.terminal_logger import terminal_logger
from app.routers.messaging import format_conversation

router = APIRouter(prefix="/api/items", tags=["Items & Postings"])

CATEGORY_IMAGES = {
    "clothing": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80",
    "electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80",
    "furniture": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
    "books": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    "food": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    "appliances": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
    "toys": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80",
    "medical": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    "school-supplies": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
    "other": "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&auto=format&fit=crop&q=80",
}


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
    # If not found or not provided, get verified users
    verified_users = db.query(User).filter(User.account_status_id == 2).order_by(User.user_id).all()
    if verified_users:
        idx = min(fallback_index, len(verified_users) - 1)
        return verified_users[idx]
    return db.query(User).first()


# ============================================================================
# DTO Schemas
# ============================================================================

class LocationDto(BaseModel):
    address: Optional[str] = "Community Area"
    barangay: Optional[str] = "San Fernando"
    municipality: Optional[str] = "City of San Fernando"
    province: Optional[str] = "La Union"
    postalCode: Optional[str] = None
    lat: Optional[float] = 16.6159
    lng: Optional[float] = 120.3209
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RequestDonationDto(BaseModel):
    userId: Optional[Any] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    posterId: Optional[Any] = None
    posterName: Optional[str] = None
    itemTitle: Optional[str] = None
    message: Optional[str] = None


class CreateItemDto(BaseModel):
    title: str = Field(..., min_length=2)
    description: str = Field(..., min_length=2)
    category: str = Field(...)  # slug, name, or id
    condition: str = Field(...)  # condition_name or id
    type: str = Field(default="donation")  # donation, exchange, request
    ownerId: Optional[Any] = Field(None, alias="owner_id")
    quantity: Optional[int] = 1
    availability: Optional[str] = "Anytime"
    images: Optional[List[str]] = []
    pickupOptions: Optional[List[str]] = ["Meet up"]
    location: Optional[LocationDto] = None
    tags: Optional[List[str]] = []

    class Config:
        populate_by_name = True


class UpdateItemDto(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    status: Optional[str] = None  # available, reserved, completed, removed
    availability: Optional[str] = None
    quantity: Optional[int] = None
    pickupOptions: Optional[List[str]] = None


# Helper to format item dictionary matching frontend Item interface
def format_item(item: Item, db: Session, current_user_id: Optional[int] = None) -> dict:
    owner = item.owner
    owner_profile = owner.profile if owner else None
    owner_name = (
        f"{owner_profile.first_name} {owner_profile.last_name}".strip()
        if owner_profile
        else (owner.email.split("@")[0] if owner else "Community Neighbor")
    )

    # Images
    sorted_images = sorted(item.images, key=lambda x: x.display_order) if item.images else []
    images = [img.image_url for img in sorted_images] if sorted_images else [
        "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&auto=format&fit=crop&q=80"
    ]

    # Pickup options
    pickup_options = [po.option_name for po in item.pickup_options] if item.pickup_options else ["Meet up"]

    # Saved/Favorited
    is_saved = False
    if current_user_id:
        is_saved = db.query(SavedItem).filter(
            SavedItem.user_id == current_user_id, SavedItem.item_id == item.item_id
        ).first() is not None

    favorites_count = db.query(SavedItem).filter(SavedItem.item_id == item.item_id).count()

    loc = item.location
    location_dict = {
        "address": loc.address_line if loc else "Community Area",
        "barangay": loc.barangay if loc else "San Fernando",
        "municipality": loc.municipality if loc else "City of San Fernando",
        "province": loc.province if loc else "La Union",
        "postalCode": loc.postal_code if loc else "",
        "lat": float(loc.latitude) if (loc and loc.latitude is not None) else 16.6159,
        "lng": float(loc.longitude) if (loc and loc.longitude is not None) else 120.3209,
    }

    owner_dict = {
        "id": f"user-{owner.user_id}" if owner else "user-1",
        "fullName": owner_name,
        "username": owner_profile.username if owner_profile else (owner.email.split("@")[0] if owner else "neighbor"),
        "email": owner.email if owner else "",
        "avatar": (owner_profile.profile_pictures[0].file_reference if owner_profile and hasattr(owner_profile, "profile_pictures") and owner_profile.profile_pictures else "") or "",
        "role": "user",
        "isVerified": True,
        "rating": 4.8,
        "reviewCount": 12,
        "joinedDate": owner.created_at.strftime("%B %Y") if (owner and owner.created_at) else "August 2026",
        "location": location_dict,
    }

    return {
        "id": f"item-{item.item_id}",
        "itemId": item.item_id,
        "title": item.title,
        "description": item.description,
        "category": item.category.slug if item.category else "other",
        "categoryName": item.category.name if item.category else "Other Community Goods",
        "condition": item.condition.condition_name if item.condition else "Good Condition",
        "type": item.item_type.type_name if item.item_type else "donation",
        "status": item.status.status_name if item.status else "available",
        "images": images,
        "pickupOptions": pickup_options,
        "availability": item.availability,
        "quantity": item.quantity,
        "ownerId": f"user-{item.owner_id}",
        "owner": owner_dict,
        "location": location_dict,
        "views": item.views_count,
        "favorites": favorites_count,
        "isFavorited": is_saved,
        "createdAt": item.created_at.isoformat() if item.created_at else datetime.now().isoformat(),
        "updatedAt": item.updated_at.isoformat() if item.updated_at else datetime.now().isoformat(),
    }


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("")
def list_items(
    category: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    item_type: Optional[str] = Query(None, alias="type"),
    status: Optional[str] = Query(None),
    barangay: Optional[str] = Query(None),
    municipality: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    owner_id: Optional[str] = Query(None, alias="ownerId"),
    user_id: Optional[str] = Query(None, alias="userId"),
    sort_by: Optional[str] = Query("newest", alias="sortBy"),
    limit: Optional[int] = Query(50),
    offset: Optional[int] = Query(0),
    db: Session = Depends(get_db),
):
    """
    List items with robust filtering, searching, and pagination from MySQL.
    """
    q = (
        db.query(Item)
        .options(
            joinedload(Item.owner).joinedload(User.profile),
            joinedload(Item.category),
            joinedload(Item.condition),
            joinedload(Item.item_type),
            joinedload(Item.status),
            joinedload(Item.location),
            joinedload(Item.images),
            joinedload(Item.pickup_options),
        )
    )

    # Filter status: default to exclude 'removed' and 'archived'
    if status and isinstance(status, str):
        q = q.join(ItemStatus, ItemStatus.item_status_id == Item.item_status_id).filter(
            ItemStatus.status_name == status
        )
    else:
        q = q.join(ItemStatus, ItemStatus.item_status_id == Item.item_status_id).filter(
            ItemStatus.status_name != "removed"
        )

    # Filter category
    if category and isinstance(category, str) and category != "all":
        q = q.join(ItemCategory, ItemCategory.category_id == Item.category_id).filter(
            or_(ItemCategory.slug == category, ItemCategory.name.ilike(f"%{category}%"))
        )

    # Filter condition
    if condition and isinstance(condition, str) and condition != "all":
        q = q.join(ItemCondition, ItemCondition.condition_id == Item.condition_id).filter(
            ItemCondition.condition_name.ilike(f"%{condition}%")
        )

    # Filter type
    if item_type and isinstance(item_type, str) and item_type != "all":
        q = q.join(ItemType, ItemType.item_type_id == Item.item_type_id).filter(
            ItemType.type_name == item_type.lower()
        )

    # Filter owner
    num_owner = parse_numeric_id(owner_id)
    if num_owner:
        q = q.filter(Item.owner_id == num_owner)

    # Filter location
    if (barangay and isinstance(barangay, str)) or (municipality and isinstance(municipality, str)):
        q = q.join(ItemLocation, ItemLocation.location_id == Item.location_id)
        if barangay and isinstance(barangay, str):
            q = q.filter(ItemLocation.barangay.ilike(f"%{barangay}%"))
        if municipality and isinstance(municipality, str):
            q = q.filter(ItemLocation.municipality.ilike(f"%{municipality}%"))

    # Search keyword
    if query and isinstance(query, str):
        search_str = f"%{query.strip()}%"
        q = q.filter(or_(Item.title.ilike(search_str), Item.description.ilike(search_str)))

    # Sort
    if sort_by == "oldest":
        q = q.order_by(asc(Item.created_at))
    elif sort_by == "popular":
        q = q.order_by(desc(Item.views_count))
    else:
        q = q.order_by(desc(Item.created_at))

    total = q.count()
    items = q.offset(offset).limit(limit).all()

    current_user_num = parse_numeric_id(user_id)
    results = [format_item(item, db, current_user_num) for item in items]

    terminal_logger.crud("FETCH", "Items", count=len(results), details=f"{len(results)} items retrieved (total in DB: {total})")

    return {
        "success": True,
        "total": total,
        "count": len(results),
        "items": results,
    }


@router.get("/saved")
def get_saved_items(user_id: str = Query(..., alias="userId"), db: Session = Depends(get_db)):
    """
    Get all saved/bookmarked items for a specific user.
    """
    num_uid = parse_numeric_id(user_id)
    if not num_uid:
        raise HTTPException(status_code=400, detail="Valid userId is required.")

    saved_entries = (
        db.query(SavedItem)
        .filter(SavedItem.user_id == num_uid)
        .order_by(desc(SavedItem.saved_at))
        .all()
    )
    saved_ids = [se.item_id for se in saved_entries]

    if not saved_ids:
        return {"success": True, "count": 0, "savedItems": [], "savedIds": []}

    items = (
        db.query(Item)
        .options(
            joinedload(Item.owner).joinedload(User.profile),
            joinedload(Item.category),
            joinedload(Item.condition),
            joinedload(Item.item_type),
            joinedload(Item.status),
            joinedload(Item.location),
            joinedload(Item.images),
            joinedload(Item.pickup_options),
        )
        .filter(Item.item_id.in_(saved_ids))
        .all()
    )

    formatted = [format_item(i, db, num_uid) for i in items]
    return {
        "success": True,
        "count": len(formatted),
        "savedIds": [f"item-{i.item_id}" for i in items],
        "savedItems": formatted,
    }


@router.get("/{item_id}")
def get_item(item_id: str, user_id: Optional[str] = Query(None, alias="userId"), db: Session = Depends(get_db)):
    """
    Fetch single item details and increment view counter.
    """
    num_id = parse_numeric_id(item_id)
    if not num_id:
        raise HTTPException(status_code=400, detail="Invalid item ID.")

    item = (
        db.query(Item)
        .options(
            joinedload(Item.owner).joinedload(User.profile),
            joinedload(Item.category),
            joinedload(Item.condition),
            joinedload(Item.item_type),
            joinedload(Item.status),
            joinedload(Item.location),
            joinedload(Item.images),
            joinedload(Item.pickup_options),
        )
        .filter(Item.item_id == num_id)
        .first()
    )

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item listing not found.")

    # Increment views count
    try:
        item.views_count += 1
        db.commit()
    except Exception:
        db.rollback()

    current_user_num = parse_numeric_id(user_id)
    return {"success": True, "item": format_item(item, db, current_user_num)}


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PUBLIC_UPLOADS_ITEMS_DIR = os.path.join(PROJECT_ROOT, "public", "uploads", "items")
os.makedirs(PUBLIC_UPLOADS_ITEMS_DIR, exist_ok=True)


@router.post("/upload-image")
async def upload_item_image(file: UploadFile = File(...)):
    """
    Accept an uploaded item image, save it permanently to public/uploads/items,
    and return the static web URL so it can be used as the thumbnail.
    """
    try:
        ext = "jpg"
        if file.filename and "." in file.filename:
            ext = file.filename.rsplit(".", 1)[1].lower()
            if ext not in ["jpg", "jpeg", "png", "webp", "gif"]:
                ext = "jpg"

        filename = f"item_{uuid.uuid4().hex[:12]}.{ext}"
        file_path = os.path.join(PUBLIC_UPLOADS_ITEMS_DIR, filename)

        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        web_url = f"/uploads/items/{filename}"
        terminal_logger.crud("UPLOAD", "ItemImage", details=f"Saved item thumbnail photo {filename} ({len(contents)} bytes)")
        return {"success": True, "url": web_url, "filename": filename}
    except Exception as ex:
        terminal_logger.error(f"Item image upload failed: {str(ex)}", category="UPLOAD")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(ex)}")


@router.post("", status_code=status.HTTP_201_CREATED)
def create_item(dto: CreateItemDto, db: Session = Depends(get_db)):
    """
    Create a new item posting in MySQL.
    """
    import traceback
    try:
        # 1. Resolve Owner ID
        owner = resolve_valid_user(dto.ownerId, db, fallback_index=0)
        if not owner:
            raise HTTPException(status_code=400, detail="Valid user account required to post item.")
        owner_id = owner.user_id

        # 2. Resolve Category ID
        cat_str = str(dto.category).strip()
        cat_num = parse_numeric_id(cat_str)
        cat = None
        if cat_num:
            cat = db.query(ItemCategory).filter(ItemCategory.category_id == cat_num).first()
        if not cat:
            cat = db.query(ItemCategory).filter(
                or_(ItemCategory.slug == cat_str.lower(), ItemCategory.name.ilike(f"%{cat_str}%"))
            ).first()
        cat_id = cat.category_id if cat else 10  # 10 is 'other'

        # 3. Resolve Condition ID
        cond_str = str(dto.condition).strip()
        cond_num = parse_numeric_id(cond_str)
        cond = None
        if cond_num:
            cond = db.query(ItemCondition).filter(ItemCondition.condition_id == cond_num).first()
        if not cond:
            cond = db.query(ItemCondition).filter(ItemCondition.condition_name.ilike(f"%{cond_str}%")).first()
        cond_id = cond.condition_id if cond else 3  # Good Condition

        # 4. Resolve Item Type ID
        type_str = (dto.type or "donation").lower().strip()
        itype = db.query(ItemType).filter(ItemType.type_name == type_str).first()
        type_id = itype.item_type_id if itype else 1

        # 5. Create Item Location
        loc_dto = dto.location or LocationDto()
        location = ItemLocation(
            address_line=loc_dto.address or "Barangay Area",
            barangay=loc_dto.barangay or "San Fernando",
            municipality=loc_dto.municipality or "City of San Fernando",
            province=loc_dto.province or "La Union",
            postal_code=loc_dto.postalCode,
            latitude=loc_dto.lat or 16.6159,
            longitude=loc_dto.lng or 120.3209,
        )
        db.add(location)
        db.flush()

        # 6. Create Item Record
        new_item = Item(
            owner_id=owner_id,
            category_id=cat_id,
            condition_id=cond_id,
            item_type_id=type_id,
            item_status_id=1,  # available
            location_id=location.location_id,
            title=dto.title.strip(),
            description=dto.description.strip(),
            quantity=dto.quantity or 1,
            availability=dto.availability or "Anytime",
            views_count=0,
        )
        db.add(new_item)
        db.flush()

        # 7. Add Images (First picture is thumbnail / display_order = 0)
        category_slug = cat.slug.lower() if (cat and hasattr(cat, "slug") and cat.slug) else cat_str.lower()
        default_img = CATEGORY_IMAGES.get(category_slug, CATEGORY_IMAGES.get("other", "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&auto=format&fit=crop&q=80"))
        images_to_add = dto.images or []
        if not images_to_add:
            images_to_add = [default_img]

        for idx, img_url in enumerate(images_to_add):
            clean_url = str(img_url or "").strip()
            if clean_url:
                # If it's a data URL, decode and write to disk in public/uploads/items/
                if clean_url.startswith("data:image/"):
                    try:
                        header, base64_data = clean_url.split(",", 1)
                        mime_ext = header.split(";")[0].split("/")[1].lower()
                        if mime_ext not in ["jpg", "jpeg", "png", "webp", "gif"]:
                            mime_ext = "png"
                        img_filename = f"item_{uuid.uuid4().hex[:12]}.{mime_ext}"
                        img_path = os.path.join(PUBLIC_UPLOADS_ITEMS_DIR, img_filename)
                        with open(img_path, "wb") as f_img:
                            f_img.write(base64.b64decode(base64_data))
                        clean_url = f"/uploads/items/{img_filename}"
                    except Exception:
                        clean_url = default_img
                # If it's an invalid or temporary blob URL or not starting with / or http, fallback to default_img
                elif clean_url.startswith("blob:") or len(clean_url) > 490 or not (clean_url.startswith("http") or clean_url.startswith("/")):
                    clean_url = default_img

                db.add(ItemImage(item_id=new_item.item_id, image_url=clean_url[:500], display_order=idx))

        # 8. Add Pickup Options
        for po in (dto.pickupOptions or ["Meet up"]):
            clean_po = str(po or "").strip()
            if clean_po:
                db.add(ItemPickupOption(item_id=new_item.item_id, option_name=clean_po[:50]))

        db.commit()
        db.refresh(new_item)

        terminal_logger.crud("CREATE", "Item", details=f"Item #{new_item.item_id} '{new_item.title}' posted ({new_item.quantity} qty)")
        terminal_logger.integration("Backend", "Database", f"Persisted item #{new_item.item_id} to MySQL", status="SUCCESS")

        return {
            "success": True,
            "message": "Item posted successfully.",
            "item": format_item(new_item, db, owner_id),
        }
    except Exception as ex:
        db.rollback()
        err_detail = traceback.format_exc()
        print("[ERROR IN CREATE_ITEM]:\n", err_detail)
        raise HTTPException(status_code=500, detail=f"Database error: {str(ex)} | TRACE: {err_detail}")


@router.put("/{item_id}")
def update_item(item_id: str, dto: UpdateItemDto, db: Session = Depends(get_db)):
    """
    Update item details, condition, or status in MySQL.
    """
    num_id = parse_numeric_id(item_id)
    item = db.query(Item).filter(Item.item_id == num_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    if dto.title:
        item.title = dto.title.strip()
    if dto.description:
        item.description = dto.description.strip()
    if dto.availability:
        item.availability = dto.availability.strip()
    if dto.quantity is not None:
        item.quantity = dto.quantity

    if dto.category:
        cat = db.query(ItemCategory).filter(
            or_(ItemCategory.slug == dto.category, ItemCategory.name.ilike(f"%{dto.category}%"))
        ).first()
        if cat:
            item.category_id = cat.category_id

    if dto.condition:
        cond = db.query(ItemCondition).filter(ItemCondition.condition_name.ilike(f"%{dto.condition}%")).first()
        if cond:
            item.condition_id = cond.condition_id

    if dto.status:
        st = db.query(ItemStatus).filter(ItemStatus.status_name == dto.status.lower()).first()
        if st:
            item.item_status_id = st.item_status_id

    db.commit()
    db.refresh(item)
    return {"success": True, "message": "Item updated successfully.", "item": format_item(item, db)}


@router.delete("/{item_id}")
def delete_item(
    item_id: str,
    user_id: Optional[str] = Query(None, alias="userId"),
    db: Session = Depends(get_db)
):
    """
    Soft-delete item (set status to 'removed').
    """
    num_id = parse_numeric_id(item_id)
    item = db.query(Item).filter(Item.item_id == num_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    caller_id = parse_numeric_id(user_id) if user_id else None
    # STRICT PERMISSION GUARD: Student admins cannot delete Jehosue's posts
    if item.owner_id == 14:
        if caller_id and caller_id != 14 and caller_id != 5:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission Denied: Student admins cannot delete or remove Jehosue's posts."
            )

    item.item_status_id = 7  # 'removed'
    db.commit()
    return {"success": True, "message": "Item removed successfully."}


@router.post("/{item_id}/save")
def toggle_save_item(item_id: str, user_id: str = Query(..., alias="userId"), db: Session = Depends(get_db)):
    """
    Bookmark or save an item to the user's saved_items table in MySQL.
    """
    num_item = parse_numeric_id(item_id)
    user = resolve_valid_user(user_id, db)
    if not num_item or not user:
        raise HTTPException(status_code=400, detail="Invalid item or user ID.")
    num_user = user.user_id

    existing = db.query(SavedItem).filter(
        SavedItem.user_id == num_user, SavedItem.item_id == num_item
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"success": True, "isSaved": False, "message": "Item removed from bookmarks."}
    else:
        new_save = SavedItem(user_id=num_user, item_id=num_item)
        db.add(new_save)

        # Notify item owner
        item = db.query(Item).filter(Item.item_id == num_item).first()
        if item and item.owner_id != num_user:
            create_notification(
                db=db,
                user_id=item.owner_id,
                type_code="item_favorited",
                title="Item Saved to Favorites",
                message=f"A neighbor bookmarked your listing \"{item.title}\".",
                link=f"/items/{num_item}",
                related_user_id=num_user,
                related_item_id=num_item,
            )

        db.commit()
        return {"success": True, "isSaved": True, "message": "Item saved to bookmarks."}


@router.post("/{item_id}/request-donation")
def request_donation(
    item_id: str,
    dto: Optional[RequestDonationDto] = Body(None),
    user_id: Optional[str] = Query(None, alias="userId"),
    db: Session = Depends(get_db),
):
    """
    Directly request a donation item by opening or reusing a conversation
    with the actual item poster and sending an automatic donation request message.
    """
    num_item = parse_numeric_id(item_id)
    item = None
    if num_item:
        item = (
            db.query(Item)
            .filter(Item.item_id == num_item)
            .options(joinedload(Item.owner).joinedload(User.profile))
            .first()
        )

    # Resolve owner: from item owner, or from DTO posterId, or fallback to an existing verified user
    owner = item.owner if item else None
    if not owner and dto and dto.posterId:
        owner = resolve_valid_user(dto.posterId, db, fallback_index=1)

    # Identify currently authenticated / requesting user
    req_uid = dto.userId if (dto and dto.userId) else user_id
    current_user = resolve_valid_user(req_uid, db, fallback_index=0)
    if not current_user:
        raise HTTPException(status_code=401, detail="Please log in to request a donation.")

    # Fallback to an existing user if still no owner
    if not owner:
        owner = (
            db.query(User)
            .filter(User.user_id != current_user.user_id)
            .order_by(User.user_id)
            .first()
        )

    if not owner:
        raise HTTPException(status_code=404, detail="This donation is currently unavailable.")

    # Prevent user from messaging themselves
    if current_user.user_id == owner.user_id:
        raise HTTPException(status_code=400, detail="You cannot request your own donation item.")

    item_title = item.title if item else (dto.itemTitle if dto and dto.itemTitle else "Donation Item")

    try:
        # Check if conversation already exists between current user and owner
        u1, u2 = current_user.user_id, owner.user_id
        conv_ids_u1 = db.query(ConversationParticipant.conversation_id).filter(ConversationParticipant.user_id == u1)
        existing_part = (
            db.query(ConversationParticipant.conversation_id)
            .filter(
                ConversationParticipant.user_id == u2,
                ConversationParticipant.conversation_id.in_(conv_ids_u1)
            )
            .first()
        )
        existing = (
            db.query(Conversation).filter(Conversation.conversation_id == existing_part[0]).first()
            if existing_part
            else None
        )

        if existing:
            conv = existing
        else:
            conv = Conversation(title=f"Inquiry: {item_title}")
            db.add(conv)
            db.flush()
            db.add(ConversationParticipant(conversation_id=conv.conversation_id, user_id=u1))
            db.add(ConversationParticipant(conversation_id=conv.conversation_id, user_id=u2))

        # Dynamic automatic donation-request message
        auto_message = (
            dto.message
            if (dto and dto.message)
            else f'Hi! I\'m interested in requesting the donation item you posted: "{item_title}".'
        )
        new_msg = Message(
            conversation_id=conv.conversation_id,
            sender_id=u1,
            message_type_id=1,  # text
            content=auto_message,
        )
        db.add(new_msg)
        conv.updated_at = datetime.now()

        # Notify poster
        sender_prof = current_user.profile
        sender_name = (
            f"{sender_prof.first_name} {sender_prof.last_name}".strip()
            if sender_prof
            else (current_user.email.split("@")[0])
        )
        create_notification(
            db=db,
            user_id=owner.user_id,
            type_code="item_request",
            title="New Donation Request",
            message=f'{sender_name} requested your donation item "{item_title}".',
            link="/messages",
            related_user_id=u1,
            related_item_id=item.item_id if item else None,
        )

        terminal_logger.log(
            "SUCCESS",
            f"User #{u1} ({sender_name}) requested donation item #{item.item_id if item else 'custom'} ('{item_title}') from #{owner.user_id}. Conversation #{conv.conversation_id} active.",
        )

        owner_prof = owner.profile
        poster_name = (
            f"{owner_prof.first_name} {owner_prof.last_name}".strip()
            if owner_prof
            else (dto.posterName if dto and dto.posterName else "Neighbor")
        )

        db.commit()
        db.refresh(conv)

        return {
            "success": True,
            "conversationId": f"chat-{conv.conversation_id}",
            "rawConversationId": conv.conversation_id,
            "itemTitle": item_title,
            "posterId": f"user-{owner.user_id}",
            "posterName": poster_name,
            "message": auto_message,
            "conversation": format_conversation(conv, u1),
        }
    except HTTPException:
        raise
    except Exception as ex:
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unable to start the conversation: {str(ex)}")
