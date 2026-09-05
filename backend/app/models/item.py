from typing import Optional, List
from datetime import datetime
from sqlalchemy import (
    BigInteger,
    SmallInteger,
    Integer,
    String,
    Text,
    DateTime,
    Numeric,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class ItemCategory(Base):
    __tablename__ = "item_categories"

    category_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    icon: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    items: Mapped[List["Item"]] = relationship("Item", back_populates="category")


class ItemCondition(Base):
    __tablename__ = "item_conditions"

    condition_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    condition_name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    items: Mapped[List["Item"]] = relationship("Item", back_populates="condition")


class ItemType(Base):
    __tablename__ = "item_types"

    item_type_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    type_name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    items: Mapped[List["Item"]] = relationship("Item", back_populates="item_type")


class ItemStatus(Base):
    __tablename__ = "item_statuses"

    item_status_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    status_name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    items: Mapped[List["Item"]] = relationship("Item", back_populates="status")


class ItemLocation(Base):
    __tablename__ = "item_locations"

    location_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    address_line: Mapped[str] = mapped_column(String(255), nullable=False)
    barangay: Mapped[str] = mapped_column(String(100), nullable=False)
    municipality: Mapped[str] = mapped_column(String(100), nullable=False)
    province: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 8), nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(11, 8), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    items: Mapped[List["Item"]] = relationship("Item", back_populates="location")


class Item(Base):
    __tablename__ = "items"

    item_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("item_categories.category_id"), nullable=False)
    condition_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("item_conditions.condition_id"), nullable=False)
    item_type_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("item_types.item_type_id"), nullable=False)
    item_status_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("item_statuses.item_status_id"), nullable=False, default=1
    )
    location_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("item_locations.location_id"), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    availability: Mapped[str] = mapped_column(String(100), default="Anytime", nullable=False)
    views_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False
    )

    owner = relationship("app.models.user.User", foreign_keys=[owner_id])
    category: Mapped["ItemCategory"] = relationship("ItemCategory", back_populates="items")
    condition: Mapped["ItemCondition"] = relationship("ItemCondition", back_populates="items")
    item_type: Mapped["ItemType"] = relationship("ItemType", back_populates="items")
    status: Mapped["ItemStatus"] = relationship("ItemStatus", back_populates="items")
    location: Mapped["ItemLocation"] = relationship("ItemLocation", back_populates="items")
    images: Mapped[List["ItemImage"]] = relationship("ItemImage", back_populates="item", cascade="all, delete-orphan")
    pickup_options: Mapped[List["ItemPickupOption"]] = relationship(
        "ItemPickupOption", back_populates="item", cascade="all, delete-orphan"
    )
    saved_by: Mapped[List["SavedItem"]] = relationship("SavedItem", back_populates="item", cascade="all, delete-orphan")


class ItemImage(Base):
    __tablename__ = "item_images"

    item_image_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("items.item_id", ondelete="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    item: Mapped["Item"] = relationship("Item", back_populates="images")


class ItemPickupOption(Base):
    __tablename__ = "item_pickup_options"

    pickup_option_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("items.item_id", ondelete="CASCADE"), nullable=False)
    option_name: Mapped[str] = mapped_column(String(50), nullable=False)

    item: Mapped["Item"] = relationship("Item", back_populates="pickup_options")


class SavedItem(Base):
    __tablename__ = "saved_items"

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("items.item_id", ondelete="CASCADE"), primary_key=True)
    saved_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    user = relationship("app.models.user.User")
    item: Mapped["Item"] = relationship("Item", back_populates="saved_by")
