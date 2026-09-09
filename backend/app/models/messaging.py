from typing import Optional, List
from datetime import datetime
from sqlalchemy import (
    BigInteger,
    Boolean,
    SmallInteger,
    String,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Conversation(Base):
    __tablename__ = "conversations"

    conversation_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False
    )

    participants: Mapped[List["ConversationParticipant"]] = relationship(
        "ConversationParticipant", back_populates="conversation", cascade="all, delete-orphan"
    )
    messages: Mapped[List["Message"]] = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan",
        foreign_keys="[Message.conversation_id]"
    )


class ConversationParticipant(Base):
    __tablename__ = "conversation_participants"

    conversation_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("conversations.conversation_id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    last_read_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="participants")
    user = relationship("app.models.user.User")


class MessageType(Base):
    __tablename__ = "message_types"

    message_type_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    type_name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)

    messages: Mapped[List["Message"]] = relationship("Message", back_populates="message_type")


class Message(Base):
    __tablename__ = "messages"

    message_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    conversation_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("conversations.conversation_id", ondelete="CASCADE"), nullable=False
    )
    sender_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    message_type_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("message_types.message_type_id"), default=1, nullable=False
    )
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    # ── Reply / Thread ───────────────────────────────────────────────────────
    reply_to_message_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("messages.message_id", ondelete="SET NULL"), nullable=True
    )

    # ── Soft-delete / Unsend ─────────────────────────────────────────────────
    is_unsent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    unsent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # ── Edit ─────────────────────────────────────────────────────────────────
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    edited_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="messages", foreign_keys=[conversation_id]
    )
    sender = relationship("app.models.user.User")
    message_type: Mapped["MessageType"] = relationship("MessageType", back_populates="messages")
    reply_to: Mapped[Optional["Message"]] = relationship(
        "Message", foreign_keys=[reply_to_message_id], remote_side="Message.message_id"
    )
    reactions: Mapped[List["MessageReaction"]] = relationship(
        "MessageReaction", back_populates="message", cascade="all, delete-orphan"
    )


class MessageReaction(Base):
    __tablename__ = "message_reactions"
    __table_args__ = (
        UniqueConstraint("message_id", "user_id", name="uq_message_user_reaction"),
    )

    reaction_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    message_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("messages.message_id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    reaction: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    message: Mapped["Message"] = relationship("Message", back_populates="reactions")
    user = relationship("app.models.user.User")

