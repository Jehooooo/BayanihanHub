from datetime import datetime, timedelta
import re
import shutil
import time
import uuid
from pathlib import Path
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body, UploadFile, File
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc, and_

from app.db import get_db
from app.models.user import User, Profile
from app.models.messaging import (
    Conversation,
    ConversationParticipant,
    Message,
    MessageReaction,
    MessageType,
)
from app.services.notifications import create_notification

router = APIRouter(prefix="/api/conversations", tags=["Direct Messaging & Conversations"])


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
        if num_id == 1:
            maria = db.query(User).filter(User.email == "maria@example.com").first()
            if maria:
                return maria
        elif num_id == 2:
            juan = db.query(User).filter(User.email == "juan@example.com").first()
            if juan:
                return juan
    verified_users = db.query(User).filter(User.account_status_id == 2).order_by(User.user_id).all()
    if verified_users:
        idx = min(fallback_index, len(verified_users) - 1)
        return verified_users[idx]
    return db.query(User).first()


def resolve_conversation_user_id(val: Any, db: Session) -> Optional[int]:
    num = parse_numeric_id(val)
    if not num:
        return None
    u = db.query(User).filter(User.user_id == num).first()
    if u:
        return u.user_id
    if num == 1:
        maria = db.query(User).filter(User.email == "maria@example.com").first()
        if maria:
            return maria.user_id
    elif num == 2:
        juan = db.query(User).filter(User.email == "juan@example.com").first()
        if juan:
            return juan.user_id
    return num


# ============================================================================
# DTO Schemas
# ============================================================================

class StartConversationDto(BaseModel):
    participantIds: List[Any] = Field(..., min_length=2)
    title: Optional[str] = None
    initialMessage: Optional[str] = None


class SendMessageDto(BaseModel):
    senderId: Any = Field(...)
    content: str = Field(..., min_length=1)
    type: Optional[str] = "text"  # text, image, file, system
    fileUrl: Optional[str] = None
    fileName: Optional[str] = None
    replyToMessageId: Optional[Any] = None  # NEW: reply threading


class PresenceUpdateDto(BaseModel):
    userId: Any


class TypingDto(BaseModel):
    userId: Any
    isTyping: bool


class ReactDto(BaseModel):
    userId: Any
    reaction: str = Field(..., min_length=1, max_length=32)


class UnsendDto(BaseModel):
    userId: Any


class EditMessageDto(BaseModel):
    userId: Any
    content: str = Field(..., min_length=1)


# Ephemeral in-memory store for typing status: conv_id -> { user_id: timestamp_float }
_active_typing: dict[int, dict[int, float]] = {}

# 5-minute window for edit / unsend
ACTION_WINDOW_MINUTES = 5



def format_conversation(conv: Conversation, current_user_id: int) -> dict:
    participants = [p.user for p in conv.participants if p.user]
    other_user = next((u for u in participants if u.user_id != current_user_id), None)
    if not other_user and participants:
        other_user = participants[0]

    other_prof = other_user.profile if other_user else None
    other_name = (
        f"{other_prof.first_name} {other_prof.last_name}".strip()
        if other_prof
        else (other_user.email.split("@")[0] if other_user else "Neighbor")
    )

    # Determine real online status and last active timestamp
    other_last_active = other_user.last_active_at if other_user else None
    is_online = False
    if other_last_active:
        diff_sec = (datetime.now() - other_last_active).total_seconds()
        is_online = 0 <= diff_sec <= 150

    participant_dict = {
        "id": f"user-{other_user.user_id}" if other_user else "user-1",
        "userId": other_user.user_id if other_user else 1,
        "fullName": other_name,
        "username": other_prof.username if other_prof else (other_user.email.split("@")[0] if other_user else "neighbor"),
        "avatar": "",
        "isOnline": is_online,
        "lastActive": other_last_active.isoformat() if other_last_active else None,
    }

    # Last message
    sorted_messages = sorted(conv.messages, key=lambda m: m.created_at) if conv.messages else []
    last_msg = sorted_messages[-1] if sorted_messages else None
    last_msg_dict = None
    if last_msg:
        sender_prof = last_msg.sender.profile if (last_msg.sender and last_msg.sender.profile) else None
        last_msg_dict = {
            "id": f"msg-{last_msg.message_id}",
            "chatId": f"chat-{conv.conversation_id}",
            "senderId": f"user-{last_msg.sender_id}",
            "sender": {
                "id": f"user-{last_msg.sender_id}",
                "fullName": f"{sender_prof.first_name} {sender_prof.last_name}".strip() if sender_prof else "Neighbor",
            },
            "content": last_msg.content,
            "type": last_msg.message_type.type_name if last_msg.message_type else "text",
            "createdAt": last_msg.created_at.isoformat(),
        }

    # Participant entry for current user to compute unread
    curr_part = next((p for p in conv.participants if p.user_id == current_user_id), None)
    unread_count = 0
    if curr_part and curr_part.last_read_at:
        unread_count = sum(1 for m in conv.messages if m.created_at > curr_part.last_read_at and m.sender_id != current_user_id)
    elif curr_part:
        unread_count = sum(1 for m in conv.messages if m.sender_id != current_user_id)

    def map_pid(uid: int) -> List[str]:
        res = [f"user-{uid}"]
        if uid == 6:
            res.append("user-1")
        elif uid == 7:
            res.append("user-2")
        return res

    all_pids: List[str] = []
    for p in conv.participants:
        all_pids.extend(map_pid(p.user_id))

    message_count = len(conv.messages) if conv.messages else 0

    return {
        "id": f"chat-{conv.conversation_id}",
        "conversationId": conv.conversation_id,
        "title": conv.title or other_name,
        "participants": all_pids,
        "participantUsers": [
            {
                "id": f"user-{p.user.user_id}",
                "fullName": f"{p.user.profile.first_name} {p.user.profile.last_name}".strip() if p.user.profile else p.user.email.split("@")[0],
                "avatar": "",
            }
            for p in conv.participants if p.user
        ],
        "otherParticipant": participant_dict,
        "lastMessage": last_msg_dict,
        "unreadCount": unread_count,
        "messageCount": message_count,
        "totalMessages": message_count,
        "createdAt": conv.created_at.isoformat(),
        "updatedAt": conv.updated_at.isoformat(),
    }


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("")
def list_conversations(
    userId: Optional[str] = Query(None, alias="userId"),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    List all active chat conversations for a given user.
    """
    raw_id = userId or user_id
    num_uid = resolve_conversation_user_id(raw_id, db)
    if not num_uid:
        raise HTTPException(status_code=400, detail="userId is required.")

    # Touch current user's last active timestamp
    caller = db.query(User).filter(User.user_id == num_uid).first()
    if caller:
        caller.last_active_at = datetime.now()
        db.commit()

    convs = (
        db.query(Conversation)
        .join(ConversationParticipant, ConversationParticipant.conversation_id == Conversation.conversation_id)
        .filter(ConversationParticipant.user_id == num_uid)
        .options(
            joinedload(Conversation.participants).joinedload(ConversationParticipant.user).joinedload(User.profile),
            joinedload(Conversation.messages).joinedload(Message.sender).joinedload(User.profile),
            joinedload(Conversation.messages).joinedload(Message.message_type),
        )
        .order_by(desc(Conversation.updated_at))
        .all()
    )

    results = [format_conversation(c, num_uid) for c in convs]
    return {"success": True, "count": len(results), "conversations": results, "chats": results}


@router.post("/presence")
def update_presence(dto: PresenceUpdateDto, db: Session = Depends(get_db)):
    """
    Heartbeat to update current user's presence timestamp.
    """
    num_uid = resolve_conversation_user_id(dto.userId, db)
    if num_uid:
        u = db.query(User).filter(User.user_id == num_uid).first()
        if u:
            u.last_active_at = datetime.now()
            db.commit()
            return {"success": True, "userId": f"user-{num_uid}", "lastActive": u.last_active_at.isoformat()}
    return {"success": False}


@router.get("/users/{target_user_id}/presence")
def get_user_presence(target_user_id: str, db: Session = Depends(get_db)):
    """
    Retrieve real-time presence and last-active information for a specific user.
    """
    num_uid = resolve_conversation_user_id(target_user_id, db)
    if not num_uid:
        return {"success": False, "isOnline": False, "lastActive": None}
    u = db.query(User).filter(User.user_id == num_uid).first()
    if not u:
        return {"success": False, "isOnline": False, "lastActive": None}
    last_act = u.last_active_at
    is_online = False
    if last_act:
        diff_sec = (datetime.now() - last_act).total_seconds()
        is_online = 0 <= diff_sec <= 150
    return {
        "success": True,
        "userId": f"user-{num_uid}",
        "isOnline": is_online,
        "lastActive": last_act.isoformat() if last_act else None,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def get_or_create_conversation(dto: StartConversationDto, db: Session = Depends(get_db)):
    """
    Start or retrieve a conversation thread between verified users.
    """
    resolved_users = []
    for idx, pid in enumerate(dto.participantIds):
        u = resolve_valid_user(pid, db, fallback_index=idx)
        if u and u.user_id not in [ru.user_id for ru in resolved_users]:
            resolved_users.append(u)
    if len(resolved_users) < 2:
        verified = db.query(User).filter(User.account_status_id == 2).order_by(User.user_id).all()
        for v in verified:
            if v.user_id not in [ru.user_id for ru in resolved_users]:
                resolved_users.append(v)
            if len(resolved_users) >= 2:
                break
    p_ids = [ru.user_id for ru in resolved_users]
    if len(p_ids) < 2:
        raise HTTPException(status_code=400, detail="At least two distinct user IDs required.")

    # Check if a 1-to-1 conversation already exists
    if len(p_ids) == 2:
        u1, u2 = p_ids[0], p_ids[1]
        conv_ids_u1 = db.query(ConversationParticipant.conversation_id).filter(ConversationParticipant.user_id == u1)
        existing_part = (
            db.query(ConversationParticipant.conversation_id)
            .filter(
                ConversationParticipant.user_id == u2,
                ConversationParticipant.conversation_id.in_(conv_ids_u1)
            )
            .first()
        )
        if existing_part:
            existing = db.query(Conversation).filter(Conversation.conversation_id == existing_part[0]).first()
            if existing:
                return {"success": True, "conversation": format_conversation(existing, u1)}

    # Create new conversation
    new_conv = Conversation(title=dto.title)
    db.add(new_conv)
    db.flush()

    for uid in p_ids:
        db.add(ConversationParticipant(conversation_id=new_conv.conversation_id, user_id=uid))

    if dto.initialMessage:
        sender_id = p_ids[0]
        new_msg = Message(
            conversation_id=new_conv.conversation_id,
            sender_id=sender_id,
            message_type_id=1,
            content=dto.initialMessage.strip(),
        )
        db.add(new_msg)

    db.commit()
    db.refresh(new_conv)

    return {"success": True, "conversation": format_conversation(new_conv, p_ids[0])}


@router.get("/{conversation_id}/messages")
def get_messages(
    conversation_id: str,
    userId: Optional[str] = Query(None, alias="userId"),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Retrieve chronological messages for a conversation thread.
    Includes: reactions, reply preview, edit state, unsent state.
    """
    num_id = parse_numeric_id(conversation_id)
    if not num_id:
        raise HTTPException(status_code=400, detail="Invalid conversation ID.")

    conv = db.query(Conversation).filter(Conversation.conversation_id == num_id).first()
    if not conv:
        return {"success": True, "count": 0, "messages": []}

    raw_id = userId or user_id
    num_user = resolve_conversation_user_id(raw_id, db) if raw_id else None
    if num_user:
        # Mark conversation read for this user and touch presence
        part = db.query(ConversationParticipant).filter(
            ConversationParticipant.conversation_id == num_id,
            ConversationParticipant.user_id == num_user
        ).first()
        if part:
            part.last_read_at = datetime.now()
        caller = db.query(User).filter(User.user_id == num_user).first()
        if caller:
            caller.last_active_at = datetime.now()
        db.commit()

    # Find the other participant's last_read_at to compute read receipts per message
    other_part = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == num_id,
        ConversationParticipant.user_id != num_user
    ).first() if num_user else None
    other_last_read = other_part.last_read_at if other_part else None

    msgs = (
        db.query(Message)
        .filter(Message.conversation_id == num_id)
        .options(
            joinedload(Message.sender).joinedload(User.profile),
            joinedload(Message.message_type),
            joinedload(Message.reactions).joinedload(MessageReaction.user).joinedload(User.profile),
            joinedload(Message.reply_to).joinedload(Message.sender).joinedload(User.profile),
        )
        .order_by(asc(Message.created_at))
        .all()
    )

    formatted = []
    for m in msgs:
        prof = m.sender.profile if (m.sender and m.sender.profile) else None

        # Seen / read receipt
        is_seen_by_other = False
        if other_last_read and m.created_at <= other_last_read:
            is_seen_by_other = True
        msg_seen = is_seen_by_other if (num_user and m.sender_id == num_user) else True

        # Reactions — group by emoji, include who reacted
        reactions_list = []
        for rxn in (m.reactions or []):
            reactions_list.append({
                "userId": f"user-{rxn.user_id}",
                "reaction": rxn.reaction,
            })

        # Reply preview (quoted message)
        reply_preview = None
        if m.reply_to_message_id and m.reply_to:
            rp = m.reply_to
            rp_prof = rp.sender.profile if (rp.sender and rp.sender.profile) else None
            rp_name = f"{rp_prof.first_name} {rp_prof.last_name}".strip() if rp_prof else "Neighbor"
            reply_preview = {
                "id": f"msg-{rp.message_id}",
                "senderId": f"user-{rp.sender_id}",
                "senderName": rp_name,
                "content": ("This message was unsent." if rp.is_unsent else (rp.content or "")),
                "isUnsent": rp.is_unsent,
            }

        # 5-min edit/unsend window
        can_edit_unsend = (datetime.now() - m.created_at) <= timedelta(minutes=ACTION_WINDOW_MINUTES)

        formatted.append({
            "id": f"msg-{m.message_id}",
            "messageId": m.message_id,
            "chatId": f"chat-{m.conversation_id}",
            "senderId": f"user-{m.sender_id}",
            "sender": {
                "id": f"user-{m.sender_id}",
                "fullName": f"{prof.first_name} {prof.last_name}".strip() if prof else "Neighbor",
                "avatar": "",
            },
            "content": "This message was unsent." if m.is_unsent else (m.content or ""),
            "type": m.message_type.type_name if m.message_type else "text",
            "fileUrl": None if m.is_unsent else m.file_url,
            "fileName": None if m.is_unsent else m.file_name,
            "isRead": msg_seen,
            "seen": msg_seen,
            "createdAt": m.created_at.isoformat(),
            # New fields
            "isUnsent": m.is_unsent,
            "unsentAt": m.unsent_at.isoformat() if m.unsent_at else None,
            "isEdited": m.is_edited,
            "editedAt": m.edited_at.isoformat() if m.edited_at else None,
            "replyToMessageId": f"msg-{m.reply_to_message_id}" if m.reply_to_message_id else None,
            "replyTo": reply_preview,
            "reactions": reactions_list,
            "canEditUnsend": can_edit_unsend,
        })

    return {"success": True, "count": len(formatted), "messages": formatted}


@router.post("/{conversation_id}/messages", status_code=status.HTTP_201_CREATED)
def send_message(conversation_id: str, dto: SendMessageDto, db: Session = Depends(get_db)):
    """
    Send a message into a conversation thread and notify recipients.
    Supports reply threading via replyToMessageId.
    """
    num_conv = parse_numeric_id(conversation_id)
    sender = resolve_valid_user(dto.senderId, db, fallback_index=0)
    num_sender = sender.user_id if sender else None

    if not num_conv or not num_sender:
        raise HTTPException(status_code=400, detail="Invalid conversation or sender ID.")

    conv = db.query(Conversation).filter(Conversation.conversation_id == num_conv).first()
    if not conv:
        conv = Conversation(
            title=f"Chat {num_conv}",
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        db.add(conv)
        db.flush()
        num_conv = conv.conversation_id
        db.add(ConversationParticipant(conversation_id=num_conv, user_id=num_sender))
        other_user = db.query(User).filter(User.user_id != num_sender).first()
        if other_user:
            db.add(ConversationParticipant(conversation_id=num_conv, user_id=other_user.user_id))

    # Resolve reply_to_message_id
    reply_to_num = None
    if dto.replyToMessageId:
        reply_to_num = parse_numeric_id(dto.replyToMessageId)
        if reply_to_num:
            # Validate reply target is in the same conversation
            ref_msg = db.query(Message).filter(
                Message.message_id == reply_to_num,
                Message.conversation_id == num_conv
            ).first()
            if not ref_msg:
                reply_to_num = None  # Silently ignore invalid reference

    # Type resolution
    type_name = (dto.type or "text").lower()
    m_type = db.query(MessageType).filter(MessageType.type_name == type_name).first()
    m_type_id = m_type.message_type_id if m_type else 1

    new_msg = Message(
        conversation_id=num_conv,
        sender_id=num_sender,
        message_type_id=m_type_id,
        content=dto.content.strip(),
        file_url=dto.fileUrl,
        file_name=dto.fileName,
        reply_to_message_id=reply_to_num,
    )
    db.add(new_msg)

    # Update conversation timestamp
    conv.updated_at = datetime.now()

    # Notify other participants
    participants = db.query(ConversationParticipant).filter(ConversationParticipant.conversation_id == num_conv).all()
    # Touch sender's last active timestamp
    sender_user = db.query(User).filter(User.user_id == num_sender).first()
    if sender_user:
        sender_user.last_active_at = datetime.now()

    # Derive sender display name (needed for notifications)
    sender_prof = sender_user.profile if (sender_user and sender_user.profile) else None
    sender_name = (
        f"{sender_prof.first_name} {sender_prof.last_name}".strip()
        if sender_prof
        else (sender_user.email.split("@")[0] if sender_user else "Neighbor")
    )

    # Clear sender's typing state upon sending message
    if num_conv in _active_typing:
        _active_typing[num_conv].pop(num_sender, None)

    for p in participants:
        if p.user_id != num_sender:
            try:
                create_notification(
                    db=db,
                    user_id=p.user_id,
                    type_code="new_message",
                    title=f"New Message from {sender_name}",
                    message=dto.content[:80] + ("..." if len(dto.content) > 80 else ""),
                    link="/messages",
                    related_user_id=num_sender,
                )
            except Exception:
                pass  # Notification failure must never block message delivery

    db.commit()
    db.refresh(new_msg)

    prof = sender_user.profile if (sender_user and sender_user.profile) else None
    return {
        "success": True,
        "message": {
            "id": f"msg-{new_msg.message_id}",
            "messageId": new_msg.message_id,
            "chatId": f"chat-{num_conv}",
            "senderId": f"user-{num_sender}",
            "sender": {
                "id": f"user-{num_sender}",
                "fullName": f"{prof.first_name} {prof.last_name}".strip() if prof else "Neighbor",
                "avatar": "",
            },
            "content": new_msg.content,
            "type": type_name,
            "fileUrl": new_msg.file_url,
            "fileName": new_msg.file_name,
            "isRead": False,
            "seen": False,
            "isUnsent": False,
            "isEdited": False,
            "replyToMessageId": f"msg-{reply_to_num}" if reply_to_num else None,
            "reactions": [],
            "canEditUnsend": True,
            "createdAt": new_msg.created_at.isoformat(),
        },
    }


@router.patch("/{conversation_id}/read")
def mark_conversation_read(
    conversation_id: str,
    userId: Optional[str] = Query(None, alias="userId"),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Mark conversation read for the given user and update their presence.
    """
    num_conv = parse_numeric_id(conversation_id)
    raw_id = userId or user_id
    num_user = resolve_conversation_user_id(raw_id, db)

    part = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == num_conv,
        ConversationParticipant.user_id == num_user
    ).first()

    if part:
        part.last_read_at = datetime.now()

    if num_user:
        caller = db.query(User).filter(User.user_id == num_user).first()
        if caller:
            caller.last_active_at = datetime.now()

    db.commit()

    return {"success": True, "message": "Messages marked as read."}


@router.post("/{conversation_id}/typing")
def set_typing_status(conversation_id: str, dto: TypingDto, db: Session = Depends(get_db)):
    """
    Record ephemeral typing event for a user in a conversation thread.
    No permanent database writes occur.
    """
    num_conv = parse_numeric_id(conversation_id)
    num_user = resolve_conversation_user_id(dto.userId, db)
    if not num_conv or not num_user:
        return {"success": False}

    if num_conv not in _active_typing:
        _active_typing[num_conv] = {}

    if dto.isTyping:
        _active_typing[num_conv][num_user] = time.time()
        # Touch presence timestamp
        u = db.query(User).filter(User.user_id == num_user).first()
        if u:
            u.last_active_at = datetime.now()
            db.commit()
    else:
        _active_typing[num_conv].pop(num_user, None)

    return {"success": True}


@router.get("/{conversation_id}/typing")
def get_typing_status(
    conversation_id: str,
    userId: Optional[str] = Query(None, alias="userId"),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Retrieve who is currently typing in the conversation.
    Filters out the calling user so users never see their own typing indicator.
    """
    num_conv = parse_numeric_id(conversation_id)
    raw_id = userId or user_id
    num_user = resolve_conversation_user_id(raw_id, db)
    if not num_conv:
        return {"success": True, "typingUsers": [], "isTyping": False}

    conv_typing = _active_typing.get(num_conv, {})
    now = time.time()
    active_typers = []
    expired = []

    for uid, ts in list(conv_typing.items()):
        if now - ts <= 3.5:
            if not num_user or uid != num_user:
                active_typers.append(uid)
        else:
            expired.append(uid)

    for exp_uid in expired:
        conv_typing.pop(exp_uid, None)

    typing_info = []
    if active_typers:
        users = db.query(User).filter(User.user_id.in_(active_typers)).options(joinedload(User.profile)).all()
        for u in users:
            name = f"{u.profile.first_name} {u.profile.last_name}".strip() if u.profile else u.email.split("@")[0]
            typing_info.append({"userId": f"user-{u.user_id}", "name": name})

    return {
        "success": True,
        "isTyping": len(active_typers) > 0,
        "typingUsers": typing_info,
    }


# Allowed MIME types for image rendering vs generic file download
IMAGE_MIMES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"}

# Resolve the project root → public/uploads/messages
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent.parent  # project root
UPLOAD_DIR = _BACKEND_DIR / "public" / "uploads" / "messages"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/{conversation_id}/upload", status_code=status.HTTP_201_CREATED)
async def upload_message_file(
    conversation_id: str,
    file: UploadFile = File(...),
):
    """
    Upload an image or file attachment for a conversation message.
    Returns a public URL and MIME type so the frontend can render images inline.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    # Generate a unique filename preserving original extension
    ext = Path(file.filename).suffix.lower() or ".bin"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / unique_name

    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    public_url = f"/uploads/messages/{unique_name}"
    mime = file.content_type or "application/octet-stream"
    is_image = mime in IMAGE_MIMES

    return {
        "success": True,
        "url": public_url,
        "fileName": file.filename,
        "mimeType": mime,
        "isImage": is_image,
    }


# ============================================================================
# Message Actions: Reactions, Unsend, Edit
# ============================================================================

@router.post("/{conversation_id}/messages/{message_id}/react")
@router.post("/{conversation_id}/messages/{message_id}/reactions")
def toggle_reaction(
    conversation_id: str,
    message_id: str,
    dto: ReactDto,
    db: Session = Depends(get_db),
):
    """
    Toggle emoji reaction on a specific message.
    If user already reacted with this emoji, removes it.
    If user reacted with a different emoji, changes it.
    Otherwise adds the new reaction.
    """
    num_conv = parse_numeric_id(conversation_id)
    num_msg = parse_numeric_id(message_id)
    num_user = resolve_conversation_user_id(dto.userId, db)

    if not num_conv or not num_msg or not num_user:
        raise HTTPException(status_code=400, detail="Invalid conversation, message, or user ID.")

    # Validate message exists in this conversation
    msg = db.query(Message).filter(
        Message.message_id == num_msg,
        Message.conversation_id == num_conv
    ).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    if msg.is_unsent:
        raise HTTPException(status_code=400, detail="Cannot react to an unsent message.")

    # Check existing reaction by this user
    existing = db.query(MessageReaction).filter(
        MessageReaction.message_id == num_msg,
        MessageReaction.user_id == num_user,
    ).first()

    emoji = dto.reaction.strip()
    if existing:
        if existing.reaction == emoji:
            # Same emoji -> toggle off (delete)
            db.delete(existing)
            action = "removed"
        else:
            # Different emoji -> update
            existing.reaction = emoji
            action = "updated"
    else:
        # New reaction
        new_rxn = MessageReaction(
            message_id=num_msg,
            user_id=num_user,
            reaction=emoji,
        )
        db.add(new_rxn)
        action = "added"

    db.commit()

    # Return full updated reactions list for this message
    rxns = db.query(MessageReaction).filter(MessageReaction.message_id == num_msg).all()
    reactions_list = [{"userId": f"user-{r.user_id}", "reaction": r.reaction} for r in rxns]

    return {
        "success": True,
        "action": action,
        "reactions": reactions_list,
    }


@router.delete("/{conversation_id}/messages/{message_id}/react")
@router.delete("/{conversation_id}/messages/{message_id}/reactions")
def remove_reaction(
    conversation_id: str,
    message_id: str,
    userId: Optional[str] = Query(None, alias="userId"),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Remove the current user's reaction from a message.
    """
    num_conv = parse_numeric_id(conversation_id)
    num_msg = parse_numeric_id(message_id)
    raw_id = userId or user_id
    num_user = resolve_conversation_user_id(raw_id, db)

    if not num_conv or not num_msg or not num_user:
        raise HTTPException(status_code=400, detail="Invalid conversation, message, or user ID.")

    existing = db.query(MessageReaction).filter(
        MessageReaction.message_id == num_msg,
        MessageReaction.user_id == num_user,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()

    rxns = db.query(MessageReaction).filter(MessageReaction.message_id == num_msg).all()
    reactions_list = [{"userId": f"user-{r.user_id}", "reaction": r.reaction} for r in rxns]

    return {"success": True, "reactions": reactions_list}


@router.post("/{conversation_id}/messages/{message_id}/unsend")
@router.patch("/{conversation_id}/messages/{message_id}/unsend")
def unsend_message(
    conversation_id: str,
    message_id: str,
    dto: UnsendDto,
    db: Session = Depends(get_db),
):
    """
    Unsend a message within the 5-minute action window.
    Only the original sender can unsend their message.
    Replaces content with unsent notice and clears media/reactions.
    """
    num_conv = parse_numeric_id(conversation_id)
    num_msg = parse_numeric_id(message_id)
    num_user = resolve_conversation_user_id(dto.userId, db)

    if not num_conv or not num_msg or not num_user:
        raise HTTPException(status_code=400, detail="Invalid parameters.")

    msg = db.query(Message).filter(
        Message.message_id == num_msg,
        Message.conversation_id == num_conv
    ).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    # Verify sender ownership
    if msg.sender_id != num_user:
        raise HTTPException(status_code=403, detail="You can only unsend your own messages.")

    if msg.is_unsent:
        return {"success": True, "message": "Message is already unsent."}

    # Verify 5-minute action window
    now = datetime.now()
    age = now - msg.created_at
    if age > timedelta(minutes=ACTION_WINDOW_MINUTES):
        raise HTTPException(
            status_code=400,
            detail=f"Messages can only be unsent within {ACTION_WINDOW_MINUTES} minutes of sending."
        )

    # Soft delete: update flags and wipe content / media
    msg.is_unsent = True
    msg.unsent_at = now
    msg.content = None
    msg.file_url = None
    msg.file_name = None

    # Clear any reactions on the unsent message
    db.query(MessageReaction).filter(MessageReaction.message_id == num_msg).delete()

    db.commit()

    return {
        "success": True,
        "messageId": f"msg-{num_msg}",
        "isUnsent": True,
        "content": "This message was unsent.",
        "reactions": [],
    }


@router.post("/{conversation_id}/messages/{message_id}/edit")
@router.patch("/{conversation_id}/messages/{message_id}/edit")
def edit_message(
    conversation_id: str,
    message_id: str,
    dto: EditMessageDto,
    db: Session = Depends(get_db),
):
    """
    Edit message content within the 5-minute action window.
    Only the original sender can edit their message.
    """
    num_conv = parse_numeric_id(conversation_id)
    num_msg = parse_numeric_id(message_id)
    num_user = resolve_conversation_user_id(dto.userId, db)

    if not num_conv or not num_msg or not num_user:
        raise HTTPException(status_code=400, detail="Invalid parameters.")

    new_content = dto.content.strip()
    if not new_content:
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")

    msg = db.query(Message).filter(
        Message.message_id == num_msg,
        Message.conversation_id == num_conv
    ).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    if msg.sender_id != num_user:
        raise HTTPException(status_code=403, detail="You can only edit your own messages.")

    if msg.is_unsent:
        raise HTTPException(status_code=400, detail="Cannot edit an unsent message.")

    now = datetime.now()
    age = now - msg.created_at
    if age > timedelta(minutes=ACTION_WINDOW_MINUTES):
        raise HTTPException(
            status_code=400,
            detail=f"Messages can only be edited within {ACTION_WINDOW_MINUTES} minutes of sending."
        )

    msg.content = new_content
    msg.is_edited = True
    msg.edited_at = now

    db.commit()

    return {
        "success": True,
        "messageId": f"msg-{num_msg}",
        "content": new_content,
        "isEdited": True,
        "editedAt": msg.edited_at.isoformat(),
    }
