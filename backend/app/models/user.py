from typing import Optional, List
from datetime import datetime
from sqlalchemy import (
    BigInteger,
    SmallInteger,
    Integer,
    String,
    Boolean,
    Text,
    DateTime,
    Numeric,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class AccountStatus(Base):
    __tablename__ = "account_statuses"

    account_status_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    status_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    users: Mapped[List["User"]] = relationship("User", back_populates="account_status")


class Role(Base):
    __tablename__ = "roles"

    role_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    role_name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user_roles: Mapped[List["UserRole"]] = relationship("UserRole", back_populates="role")


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(191), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    account_status_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("account_statuses.account_status_id"), nullable=False, default=1
    )
    is_suspended: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_trusted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False
    )
    last_active_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    account_status: Mapped["AccountStatus"] = relationship("AccountStatus", back_populates="users")
    profile: Mapped[Optional["Profile"]] = relationship("Profile", back_populates="user", uselist=False)
    user_roles: Mapped[List["UserRole"]] = relationship("UserRole", back_populates="user")
    badges: Mapped[List["UserBadge"]] = relationship("UserBadge", back_populates="user")
    profile_pictures: Mapped[List["ProfilePicture"]] = relationship(
        "ProfilePicture", foreign_keys="ProfilePicture.user_id", back_populates="user"
    )


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    role_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("roles.role_id"), primary_key=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="user_roles")
    role: Mapped["Role"] = relationship("Role", back_populates="user_roles")


class Profile(Base):
    __tablename__ = "profiles"

    profile_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    middle_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    address_line: Mapped[str] = mapped_column(String(255), nullable=False)
    barangay: Mapped[str] = mapped_column(String(100), nullable=False)
    municipality: Mapped[str] = mapped_column(String(100), nullable=False)
    province: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 8), nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(11, 8), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="profile")


class Badge(Base):
    __tablename__ = "badges"

    badge_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    badge_code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str] = mapped_column(String(32), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)

    user_badges: Mapped[List["UserBadge"]] = relationship("UserBadge", back_populates="badge")


class UserBadge(Base):
    __tablename__ = "user_badges"

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    badge_id: Mapped[int] = mapped_column(Integer, ForeignKey("badges.badge_id"), primary_key=True)
    earned_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="badges")
    badge: Mapped["Badge"] = relationship("Badge", back_populates="user_badges")


class ProfilePictureStatus(Base):
    __tablename__ = "profile_picture_statuses"

    status_id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    status_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    pictures: Mapped[List["ProfilePicture"]] = relationship("ProfilePicture", back_populates="status")


class ProfilePicture(Base):
    __tablename__ = "profile_pictures"

    profile_picture_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    file_reference: Mapped[str] = mapped_column(String(500), nullable=False)
    status_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("profile_picture_statuses.status_id"), nullable=False, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    rejection_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    reviewed_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="profile_pictures")
    status: Mapped["ProfilePictureStatus"] = relationship("ProfilePictureStatus", back_populates="pictures")
    reviewer: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reviewed_by])
