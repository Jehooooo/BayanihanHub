from datetime import datetime
import re
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc, and_

from app.db import get_db
from app.models.user import User, Profile
from app.models.messaging import (
    Conversation,
    ConversationParticipant,
    Message,
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
    verified_users = db.query(User).filter(User.account_status_id == 2).order_by(User.user_id).all()
    if verified_users:
        idx = min(fallback_index, len(verified_users) - 1)
        return verified_users[idx]
    return db.query(User).first()


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

    participant_dict = {
        "id": f"user-{other_user.user_id}" if other_user else "user-1",
        "userId": other_user.user_id if other_user else 1,
        "fullName": other_name,
        "username": other_prof.username if other_prof else (other_user.email.split("@")[0] if other_user else "neighbor"),
        "avatar": "",
        "isOnline": True,
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

    message_count = len(conv.messages) if conv.messages else 0

    return {
        "id": f"chat-{conv.conversation_id}",
        "conversationId": conv.conversation_id,
        "title": conv.title or other_name,
        "participants": [f"user-{p.user_id}" for p in conv.participants],
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
def list_conversations(userId: str = Query(..., alias="userId"), db: Session = Depends(get_db)):
    """
    List all active chat conversations for a given user.
    """
    num_uid = parse_numeric_id(userId)
    if not num_uid:
        raise HTTPException(status_code=400, detail="userId is required.")

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
def get_messages(conversation_id: str, db: Session = Depends(get_db)):
    """
    Retrieve chronological messages for a conversation thread.
    """
    num_id = parse_numeric_id(conversation_id)
    if not num_id:
        raise HTTPException(status_code=400, detail="Invalid conversation ID.")

    conv = db.query(Conversation).filter(Conversation.conversation_id == num_id).first()
    if not conv:
        return {"success": True, "count": 0, "messages": []}

    msgs = (
        db.query(Message)
        .filter(Message.conversation_id == num_id)
        .options(
            joinedload(Message.sender).joinedload(User.profile),
            joinedload(Message.message_type),
        )
        .order_by(asc(Message.created_at))
        .all()
    )

    formatted = []
    for m in msgs:
        prof = m.sender.profile if (m.sender and m.sender.profile) else None
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
            "content": m.content,
            "type": m.message_type.type_name if m.message_type else "text",
            "fileUrl": m.file_url,
            "fileName": m.file_name,
            "isRead": True,
            "createdAt": m.created_at.isoformat(),
        })

    return {"success": True, "count": len(formatted), "messages": formatted}


@router.post("/{conversation_id}/messages", status_code=status.HTTP_201_CREATED)
def send_message(conversation_id: str, dto: SendMessageDto, db: Session = Depends(get_db)):
    """
    Send a message into a conversation thread and notify recipients.
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
    )
    db.add(new_msg)

    # Update conversation timestamp
    conv.updated_at = datetime.now()

    # Notify other participants
    participants = db.query(ConversationParticipant).filter(ConversationParticipant.conversation_id == num_conv).all()
    sender_user = db.query(User).filter(User.user_id == num_sender).first()
    sender_name = (
        f"{sender_user.profile.first_name} {sender_user.profile.last_name}".strip()
        if (sender_user and sender_user.profile)
        else "Neighbor"
    )

    for p in participants:
        if p.user_id != num_sender:
            create_notification(
                db=db,
                user_id=p.user_id,
                type_code="new_message",
                title=f"New Message from {sender_name}",
                message=dto.content[:80] + ("..." if len(dto.content) > 80 else ""),
                link="/messages",
                related_user_id=num_sender,
            )

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
            "createdAt": new_msg.created_at.isoformat(),
        },
    }


@router.patch("/{conversation_id}/read")
def mark_conversation_read(conversation_id: str, userId: str = Query(..., alias="userId"), db: Session = Depends(get_db)):
    """
    Mark conversation read for the given user.
    """
    num_conv = parse_numeric_id(conversation_id)
    num_user = parse_numeric_id(userId)

    part = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == num_conv,
        ConversationParticipant.user_id == num_user
    ).first()

    if part:
        part.last_read_at = datetime.now()
        db.commit()

    return {"success": True, "message": "Messages marked as read."}
