from typing import Optional, List
from datetime import datetime
from sqlalchemy import (
    BigInteger,
    SmallInteger,
    String,
    Text,
    DateTime,
    Enum,
    CheckConstraint,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class ExchangeStatus(Base):
    __tablename__ = "exchange_statuses"

    exchange_status_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    status_name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    exchanges: Mapped[List["Exchange"]] = relationship("Exchange", back_populates="status")


class Exchange(Base):
    __tablename__ = "exchanges"

    exchange_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    exchange_status_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("exchange_statuses.exchange_status_id"), nullable=False, default=1
    )
    meeting_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    meeting_location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    status: Mapped["ExchangeStatus"] = relationship("ExchangeStatus", back_populates="exchanges")
    participants: Mapped[List["ExchangeParticipant"]] = relationship(
        "ExchangeParticipant", back_populates="exchange", cascade="all, delete-orphan"
    )
    exchange_items: Mapped[List["ExchangeItem"]] = relationship(
        "ExchangeItem", back_populates="exchange", cascade="all, delete-orphan"
    )
    history: Mapped[List["ExchangeHistory"]] = relationship(
        "ExchangeHistory", back_populates="exchange", cascade="all, delete-orphan"
    )
    ratings: Mapped[List["Rating"]] = relationship("Rating", back_populates="exchange", cascade="all, delete-orphan")


class ExchangeParticipant(Base):
    __tablename__ = "exchange_participants"

    exchange_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("exchanges.exchange_id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), primary_key=True)
    participant_role: Mapped[str] = mapped_column(Enum("offerer", "receiver", name="exchange_participant_role"), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    exchange: Mapped["Exchange"] = relationship("Exchange", back_populates="participants")
    user = relationship("app.models.user.User")


class ExchangeItem(Base):
    __tablename__ = "exchange_items"

    exchange_item_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    exchange_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("exchanges.exchange_id", ondelete="CASCADE"), nullable=False)
    item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("items.item_id"), nullable=False)
    offered_by_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    role: Mapped[str] = mapped_column(Enum("offered", "requested", name="exchange_item_role"), nullable=False)

    exchange: Mapped["Exchange"] = relationship("Exchange", back_populates="exchange_items")
    item = relationship("app.models.item.Item")
    offered_by = relationship("app.models.user.User")


class ExchangeHistory(Base):
    __tablename__ = "exchange_history"

    history_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    exchange_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("exchanges.exchange_id", ondelete="CASCADE"), nullable=False)
    action: Mapped[str] = mapped_column(String(64), nullable=False)
    performed_by: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    exchange: Mapped["Exchange"] = relationship("Exchange", back_populates="history")
    actor = relationship("app.models.user.User")


class Rating(Base):
    __tablename__ = "ratings"
    __table_args__ = (CheckConstraint("score >= 1 AND score <= 5", name="chk_ratings_score"),)

    rating_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    exchange_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("exchanges.exchange_id", ondelete="CASCADE"), nullable=False)
    rater_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    rated_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    score: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    review: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    exchange: Mapped["Exchange"] = relationship("Exchange", back_populates="ratings")
    rater = relationship("app.models.user.User", foreign_keys=[rater_id])
    rated_user = relationship("app.models.user.User", foreign_keys=[rated_user_id])
