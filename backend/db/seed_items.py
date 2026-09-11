import sys
from pathlib import Path
from datetime import datetime, date, timedelta

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.db import SessionLocal
from app.models.user import User, Profile
from app.models.item import (
    Item,
    ItemCategory,
    ItemCondition,
    ItemType,
    ItemStatus,
    ItemLocation,
    ItemImage,
    ItemPickupOption,
)
from app.models.request import ItemRequest, RequestUrgency, RequestStatus, RequestImage
from sqlalchemy import or_


ITEMS_DATA = [
    # ── 4 DONATIONS ──
    {
        "title": "Elementary School Supplies Pack",
        "category_slug": "school-supplies",
        "condition_name": "Brand New",
        "type_name": "donation",
        "quantity": 2,
        "availability": "Weekdays 4pm - 7pm, Barangay Poblacion Hall",
        "description": "Complete set containing 6 spiral notebooks, pad paper, 12-color crayons, ballpens, pencil case, and ruler for elementary students in need.",
        "location": {
            "address_line": "Barangay Poblacion Hall",
            "barangay": "Poblacion",
            "municipality": "San Fernando",
            "province": "La Union",
            "postal_code": "2500",
            "latitude": 16.6159,
            "longitude": 120.3209,
        },
        "images": [
            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80"
        ],
        "pickup_options": ["Meet up", "Barangay Hall Pickup"],
    },
    {
        "title": "College Algebra & General Science Used Textbooks",
        "category_slug": "books",
        "condition_name": "Good Condition",
        "type_name": "donation",
        "quantity": 1,
        "availability": "Any day after 2pm",
        "description": "Set of college and high school reviewer textbooks in good clean condition. No missing pages, slight highlighter marks. Free for any student.",
        "location": {
            "address_line": "Poblacion Plaza",
            "barangay": "Poblacion",
            "municipality": "San Fernando",
            "province": "La Union",
            "postal_code": "2500",
            "latitude": 16.6155,
            "longitude": 120.3212,
        },
        "images": [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
        ],
        "pickup_options": ["Meet up", "Drop off"],
    },
    {
        "title": "Men's Clean Office & Casual Polo Shirts",
        "category_slug": "clothing",
        "condition_name": "Like New",
        "type_name": "donation",
        "quantity": 4,
        "availability": "Weekends anytime",
        "description": "4 pieces of freshly laundered button-down polo shirts (Size Medium). Worn only a few times, perfect for job interviews or daily work.",
        "location": {
            "address_line": "Rizal Street",
            "barangay": "Poblacion",
            "municipality": "San Fernando",
            "province": "La Union",
            "postal_code": "2500",
            "latitude": 16.6160,
            "longitude": 120.3200,
        },
        "images": [
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80"
        ],
        "pickup_options": ["Meet up"],
    },
    {
        "title": "Stainless Steel Cooking Utensils & Frying Pan Set",
        "category_slug": "appliances",
        "condition_name": "Good Condition",
        "type_name": "donation",
        "quantity": 1,
        "availability": "Flexible schedule",
        "description": "Sturdy stainless steel ladle, spatula, tong, and 24cm non-stick frying pan. Downsizing kitchen items, fully functional and cleaned.",
        "location": {
            "address_line": "MacArthur Highway, San Antonio",
            "barangay": "San Antonio",
            "municipality": "Aringay",
            "province": "La Union",
            "postal_code": "2503",
            "latitude": 16.3980,
            "longitude": 120.3540,
        },
        "images": [
            "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80"
        ],
        "pickup_options": ["Meet up", "Barangay Hall Pickup"],
    },

    # ── 3 REQUESTS ──
    {
        "title": "Durable Water-Resistant School Backpack",
        "category_slug": "school-supplies",
        "condition_name": "Good Condition",
        "type_name": "request",
        "quantity": 1,
        "availability": "Anytime",
        "urgency_name": "high",
        "needed_days": 14,
        "description": "Looking for a sturdy backpack for an incoming Grade 7 student. Any dark or neutral color. Will be deeply appreciated.",
        "location": {
            "address_line": "Barangay Poblacion",
            "barangay": "Poblacion",
            "municipality": "San Fernando",
            "province": "La Union",
            "postal_code": "2500",
            "latitude": 16.6159,
            "longitude": 120.3209,
        },
        "images": [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"
        ],
        "pickup_options": ["Meet up"],
    },
    {
        "title": "Toddler & Children's Clothing (Ages 3-5)",
        "category_slug": "clothing",
        "condition_name": "Good Condition",
        "type_name": "request",
        "quantity": 3,
        "availability": "Flexible",
        "urgency_name": "medium",
        "needed_days": 21,
        "description": "Requesting gently used play clothes, t-shirts, and shorts for 4-year-old boy. Any clean hand-me-downs are welcome.",
        "location": {
            "address_line": "Carlatan Coastal Road",
            "barangay": "Carlatan",
            "municipality": "San Fernando",
            "province": "La Union",
            "postal_code": "2500",
            "latitude": 16.6310,
            "longitude": 120.3150,
        },
        "images": [
            "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80"
        ],
        "pickup_options": ["Meet up", "Drop off"],
    },
    {
        "title": "Pantry Relief Essentials & Rice Sack",
        "category_slug": "food",
        "condition_name": "Brand New",
        "type_name": "request",
        "quantity": 1,
        "availability": "Immediate / Urgent",
        "urgency_name": "critical",
        "needed_days": 7,
        "description": "Requesting a 5kg sack of rice and canned goods for a family recovering from recent typhoon flood in Barangay Poblacion.",
        "location": {
            "address_line": "Riverside Area, Poblacion",
            "barangay": "Poblacion",
            "municipality": "San Fernando",
            "province": "La Union",
            "postal_code": "2500",
            "latitude": 16.6159,
            "longitude": 120.3209,
        },
        "images": [
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
        ],
        "pickup_options": ["Drop off", "Barangay Hall Pickup"],
    },

    # ── 3 EXCHANGES ──
    {
        "title": "Senior High Engineering Math Reviewer for Grade 10 Science Books",
        "category_slug": "books",
        "condition_name": "Like New",
        "type_name": "exchange",
        "quantity": 1,
        "availability": "Weekdays after 5pm",
        "description": "Offering SHS STEM calculus and physics review manuals. Looking to swap for Grade 10 science and math modules for my younger sibling.",
        "location": {
            "address_line": "Poblacion Plaza",
            "barangay": "Poblacion",
            "municipality": "San Fernando",
            "province": "La Union",
            "postal_code": "2500",
            "latitude": 16.6159,
            "longitude": 120.3209,
        },
        "images": [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
        ],
        "pickup_options": ["Meet up"],
    },
    {
        "title": "Electric Stand Fan for Induction Cooker or Rice Cooker",
        "category_slug": "appliances",
        "condition_name": "Good Condition",
        "type_name": "exchange",
        "quantity": 1,
        "availability": "Weekends",
        "description": "Standard 16-inch 3-speed desk/stand fan in 100% working condition. Looking to trade for a small rice cooker or single induction stove.",
        "location": {
            "address_line": "San Antonio Barangay Road",
            "barangay": "San Antonio",
            "municipality": "Aringay",
            "province": "La Union",
            "postal_code": "2503",
            "latitude": 16.3980,
            "longitude": 120.3540,
        },
        "images": [
            "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80"
        ],
        "pickup_options": ["Meet up"],
    },
    {
        "title": "Women's Denim Jacket (Medium) for School Uniform Blouses",
        "category_slug": "clothing",
        "condition_name": "Like New",
        "type_name": "exchange",
        "quantity": 1,
        "availability": "Weekdays anytime",
        "description": "Classic blue denim jacket in great condition. Want to exchange for 2 white high school uniform blouses (Size Medium or Large).",
        "location": {
            "address_line": "Poblacion",
            "barangay": "Poblacion",
            "municipality": "San Fernando",
            "province": "La Union",
            "postal_code": "2500",
            "latitude": 16.6159,
            "longitude": 120.3209,
        },
        "images": [
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80"
        ],
        "pickup_options": ["Meet up"],
    },
]


def seed_items():
    db = SessionLocal()
    try:
        # 1. DYNAMICALLY FIND JEHOSUE
        jehosue = (
            db.query(User)
            .outerjoin(Profile, Profile.user_id == User.user_id)
            .filter(
                or_(
                    User.email == "jehosuebiscarra@gmail.com",
                    Profile.first_name == "Jehosue",
                )
            )
            .first()
        )

        if not jehosue:
            raise RuntimeError(
                "CRITICAL ERROR: Jehosue account not found in database! "
                "Aborting seed to prevent assigning items to an invalid user."
            )

        print(f"[SEED] Found real Jehosue account: user_id={jehosue.user_id}, email={jehosue.email}")

        # Ensure Jehosue's password allows login with 'password123' if requested
        # We can update password_hash to 'password123' if it's not set
        if jehosue.password_hash != "password123":
            print(f"[SEED] Ensuring Jehosue password supports plain text 'password123'")
            jehosue.password_hash = "password123"
            db.commit()

        # Cache reference tables
        categories = {c.slug: c for c in db.query(ItemCategory).all()}
        conditions = {c.condition_name: c for c in db.query(ItemCondition).all()}
        types = {t.type_name: t for t in db.query(ItemType).all()}
        statuses = {s.status_name: s for s in db.query(ItemStatus).all()}
        avail_status = statuses.get("available") or list(statuses.values())[0]

        urgencies = {u.urgency_name: u for u in db.query(RequestUrgency).all()}
        req_statuses = {s.status_name: s for s in db.query(RequestStatus).all()}
        active_req_status = req_statuses.get("active") or list(req_statuses.values())[0]

        created_count = 0
        skipped_count = 0

        for data in ITEMS_DATA:
            # Check if item with this title already exists for Jehosue (Idempotency)
            existing_item = (
                db.query(Item)
                .filter(Item.owner_id == jehosue.user_id, Item.title == data["title"])
                .first()
            )

            if existing_item:
                print(f"[SEED] Item '{data['title']}' already exists for Jehosue (ID {existing_item.item_id}). Skipping.")
                skipped_count += 1
                continue

            # 1. Create Location
            loc_data = data["location"]
            location = ItemLocation(
                address_line=loc_data["address_line"],
                barangay=loc_data["barangay"],
                municipality=loc_data["municipality"],
                province=loc_data["province"],
                postal_code=loc_data.get("postal_code", "2500"),
                latitude=loc_data.get("latitude"),
                longitude=loc_data.get("longitude"),
            )
            db.add(location)
            db.flush()

            # 2. Lookup foreign key references
            cat = categories.get(data["category_slug"])
            cond = conditions.get(data["condition_name"])
            itype = types.get(data["type_name"])

            if not cat or not cond or not itype:
                raise RuntimeError(
                    f"Missing reference data for category={data['category_slug']}, "
                    f"condition={data['condition_name']}, type={data['type_name']}"
                )

            # 3. Create Item
            item = Item(
                owner_id=jehosue.user_id,
                category_id=cat.category_id,
                condition_id=cond.condition_id,
                item_type_id=itype.item_type_id,
                item_status_id=avail_status.item_status_id,
                location_id=location.location_id,
                title=data["title"],
                description=data["description"],
                quantity=data.get("quantity", 1),
                availability=data.get("availability", "Anytime"),
                views_count=12,
            )
            db.add(item)
            db.flush()

            # 4. Create Item Images
            for order, img_url in enumerate(data.get("images", [])):
                img = ItemImage(
                    item_id=item.item_id,
                    image_url=img_url,
                    display_order=order,
                )
                db.add(img)

            # 5. Create Pickup Options
            for opt_name in data.get("pickup_options", ["Meet up"]):
                po = ItemPickupOption(
                    item_id=item.item_id,
                    option_name=opt_name,
                )
                db.add(po)

            # 6. If item is a request, also register it in item_requests
            if data["type_name"] == "request":
                urg = urgencies.get(data.get("urgency_name", "medium")) or list(urgencies.values())[0]
                needed_days = data.get("needed_days", 14)
                needed_date = date.today() + timedelta(days=needed_days)

                req = ItemRequest(
                    user_id=jehosue.user_id,
                    category_id=cat.category_id,
                    urgency_id=urg.urgency_id,
                    request_status_id=active_req_status.request_status_id,
                    location_id=location.location_id,
                    title=data["title"],
                    description=data["description"],
                    needed_before=needed_date,
                )
                db.add(req)
                db.flush()

                for order, img_url in enumerate(data.get("images", [])):
                    rimg = RequestImage(
                        request_id=req.request_id,
                        image_url=img_url,
                        display_order=order,
                    )
                    db.add(rimg)

            created_count += 1
            print(f"[SEED] Created item '{item.title}' (ID {item.item_id}, type={data['type_name']}) for Jehosue.")

        db.commit()
        print(f"\n[SUCCESS] Seeding complete! {created_count} items created, {skipped_count} skipped.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_items()
