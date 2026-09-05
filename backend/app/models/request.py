from typing import Optional, List
from datetime import datetime, date
from sqlalchemy import (
    BigInteger,
    SmallInteger,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class RequestUrgency(Base):
    __tablename__ = "request_urgencies"

    urgency_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    urgency_name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    level: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)

    requests: Mapped[List["ItemRequest"]] = relationship("ItemRequest", back_populates="urgency")


class RequestStatus(Base):
    __tablename__ = "request_statuses"

    request_status_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    status_name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    requests: Mapped[List["ItemRequest"]] = relationship("ItemRequest", back_populates="status")


class ItemRequest(Base):
    __tablename__ = "item_requests"

    request_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("item_categories.category_id"), nullable=False)
    urgency_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("request_urgencies.urgency_id"), nullable=False)
    request_status_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("request_statuses.request_status_id"), nullable=False, default=1
    )
    location_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("item_locations.location_id"), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    needed_before: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False
    )

    user = relationship("app.models.user.User", foreign_keys=[user_id])
    category = relationship("app.models.item.ItemCategory")
    urgency: Mapped["RequestUrgency"] = relationship("RequestUrgency", back_populates="requests")
    status: Mapped["RequestStatus"] = relationship("RequestStatus", back_populates="requests")
    location = relationship("app.models.item.ItemLocation")
    images: Mapped[List["RequestImage"]] = relationship("RequestImage", back_populates="request", cascade="all, delete-orphan")


class RequestImage(Base):
    __tablename__ = "request_images"

    request_image_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    request_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("item_requests.request_id", ondelete="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    request: Mapped["ItemRequest"] = relationship("ItemRequest", back_populates="images")
