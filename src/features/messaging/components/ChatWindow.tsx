import { useRef, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Avatar from '@/components/ui/Avatar';
import MessageInput, { type SendMessagePayload } from './MessageInput';
import MessageActionMenu from './MessageActionMenu';
import ReactionDisplay from './ReactionDisplay';
import type { Chat, Message, User } from '@/types';
import { useChatStore } from '@/stores/chatStore';
import { getPresenceInfo } from '@/utils/presence';

// ── Timestamp helpers ──────────────────────────────────────────────────────────

function formatMessageTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;

    // Same day → show time (e.g. "2:45 PM")
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate();

    if (isYesterday) {
      return `Yesterday ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }

    // Older → short date + time
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg)$/i;

function isImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return IMAGE_EXTENSIONS.test(url.split('?')[0]);
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

interface LightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

function Lightbox({ src, alt = 'Image', onClose }: LightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label="Full-size image"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        cursor: 'zoom-out',
        animation: 'fade-in 150ms ease-out',
      }}
    >
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
          cursor: 'default',
        }}
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image"
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '9999px',
          color: '#fff',
          width: '2.25rem',
          height: '2.25rem',
          cursor: 'pointer',
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────────

interface BubbleProps {
  msg: Message;
  isMe: boolean;
  partner?: User;
  currentUserId: string;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onImageClick: (url: string) => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onUnsend: () => void;
  onJumpToReply: (messageId: string) => void;
  isHighlighted: boolean;
  messageRefCallback: (el: HTMLDivElement | null) => void;
}

function MessageBubble({
  msg,
  isMe,
  partner,
  currentUserId,
  isMenuOpen,
  onOpenMenu,
  onCloseMenu,
  onImageClick,
  onReact,
  onReply,
  onEdit,
  onUnsend,
  onJumpToReply,
  isHighlighted,
  messageRefCallback,
}: BubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isUnsent = !!msg.isUnsent;
  const hasImage = !isUnsent && (msg.type === 'image' || isImageUrl(msg.fileUrl));
  const hasFile = !isUnsent && !hasImage && !!msg.fileUrl;

  return (
    <div
      ref={messageRefCallback}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        width: '100%',
        paddingLeft: isMe ? '2.5rem' : 0,
        paddingRight: isMe ? 0 : '2.5rem',
        position: 'relative',
        transition: 'background-color 0.3s ease',
        borderRadius: '0.75rem',
        backgroundColor: isHighlighted ? 'rgba(254, 240, 138, 0.4)' : 'transparent',
      }}
      className="group"
    >
      {/* Main message bubble row with 3-dot action button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          maxWidth: '85%',
          flexDirection: isMe ? 'row-reverse' : 'row',
        }}
      >
        {!isMe && partner && (
          <Avatar
            src={partner.avatar}
            name={partner.fullName}
            size="xs"
            style={{ flexShrink: 0, alignSelf: 'flex-end', marginBottom: '0.25rem' }}
          />
        )}

        {/* Message Bubble */}
        <div
          style={{
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.75rem',
            lineHeight: '1.5',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
            backgroundColor: isUnsent
              ? '#f3f4f6'
              : isMe
              ? 'var(--color-primary-600)'
              : '#fff',
            color: isUnsent
              ? '#6b7280'
              : isMe
              ? '#fff'
              : 'var(--color-neutral-900)',
            border: isMe && !isUnsent ? 'none' : '1px solid var(--color-neutral-200)',
            position: 'relative',
          }}
        >
          {/* Quoted Replied Message (if any) */}
          {msg.replyTo && !isUnsent && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (msg.replyTo?.id) {
                  onJumpToReply(msg.replyTo.id);
                }
              }}
              style={{
                padding: '0.375rem 0.625rem',
                margin: '0.375rem 0.5rem 0.25rem',
                borderRadius: '0.5rem',
                backgroundColor: isMe ? 'rgba(0, 0, 0, 0.15)' : '#f1f5f9',
                borderLeft: `3px solid ${isMe ? '#ffffff' : '#3b82f6'}`,
                cursor: 'pointer',
                fontSize: '0.6875rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.125rem',
                maxWidth: '18rem',
              }}
              className="hover:opacity-90 transition-opacity"
              title="Click to jump to original message"
            >
              <span style={{ fontWeight: 600, color: isMe ? '#e0e7ff' : '#2563eb' }}>
                {msg.replyTo.senderName || 'Neighbor'}
              </span>
              <span
                style={{
                  color: isMe ? 'rgba(255,255,255,0.85)' : '#64748b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontStyle: msg.replyTo.isUnsent ? 'italic' : 'normal',
                }}
              >
                {msg.replyTo.isUnsent ? 'This message was unsent.' : (msg.replyTo.content || 'Attachment')}
              </span>
            </div>
          )}

          {/* Unsent Message Notice */}
          {isUnsent ? (
            <p
              style={{
                margin: 0,
                padding: '0.5rem 0.875rem',
                fontStyle: 'italic',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <span>🚫</span> This message was unsent.
            </p>
          ) : (
            <>
              {/* Inline image */}
              {hasImage && msg.fileUrl && (
                <img
                  src={msg.fileUrl}
                  alt={msg.fileName || 'Attachment'}
                  onClick={() => onImageClick(msg.fileUrl!)}
                  style={{
                    display: 'block',
                    maxWidth: '16rem',
                    maxHeight: '12rem',
                    width: '100%',
                    objectFit: 'cover',
                    cursor: 'zoom-in',
                    borderBottom: msg.content && !msg.content.startsWith('Sent an image')
                      ? `1px solid ${isMe ? 'rgba(255,255,255,0.15)' : 'var(--color-neutral-200)'}`
                      : 'none',
                  }}
                />
              )}

              {/* File download link */}
              {hasFile && (
                <a
                  href={msg.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={msg.fileName}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1rem',
                    fontWeight: 600,
                    color: isMe ? '#fff' : 'var(--color-primary-700)',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  {msg.fileName || 'Download file'}
                </a>
              )}

              {/* Text content */}
              {msg.content && !(hasImage && msg.content.startsWith('Sent an image')) && (
                <p style={{ margin: 0, wordBreak: 'break-word', padding: '0.625rem 1rem', paddingTop: hasImage || hasFile ? '0.375rem' : '0.625rem' }}>
                  {msg.content}
                </p>
              )}
            </>
          )}

          {/* Timestamp, Edited Flag, and Read/Seen Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.375rem',
              padding: '0 0.75rem 0.4rem',
            }}
          >
            {msg.isEdited && !isUnsent && (
              <span
                style={{
                  fontSize: '0.5625rem',
                  fontStyle: 'italic',
                  color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--color-neutral-400)',
                }}
              >
                (edited)
              </span>
            )}
            <span
              style={{
                fontSize: '0.5625rem',
                fontWeight: 500,
                color: isUnsent ? '#9ca3af' : isMe ? 'var(--color-primary-100)' : 'var(--color-neutral-400)',
              }}
            >
              {formatMessageTime(msg.createdAt)}
            </span>
            {isMe && !isUnsent && (
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                {msg.isRead || (msg as any).seen ? (
                  <>
                    <span style={{ fontSize: '0.6875rem' }}>✓✓</span> Seen
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '0.6875rem' }}>✓</span> Sent
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {/* 3-Dot Action Menu Button (visible on hover or when open) */}
        {!isUnsent && (
          <div
            style={{
              opacity: isHovered || isMenuOpen ? 1 : 0,
              transition: 'opacity 0.15s ease',
              flexShrink: 0,
            }}
          >
            <MessageActionMenu
              message={msg}
              isMe={isMe}
              isOpen={isMenuOpen}
              onOpen={onOpenMenu}
              onClose={onCloseMenu}
              onReact={onReact}
              onReply={onReply}
              onEdit={onEdit}
              onUnsend={onUnsend}
            />
          </div>
        )}
      </div>

      {/* Reaction Display Group below message bubble */}
      {!isUnsent && (
        <ReactionDisplay
          reactions={msg.reactions}
          currentUserId={currentUserId}
          onToggleReaction={onReact}
          isMe={isMe}
        />
      )}
    </div>
  );
}

// ── ChatWindow ─────────────────────────────────────────────────────────────────

interface ChatWindowProps {
  chat: Chat | null;
  messages: Message[];
  currentUserId: string;
  partner?: User;
  isTyping?: boolean;
  isPartnerTyping?: boolean;
  partnerTypingName?: string;
  onSendMessage: (payload: SendMessagePayload) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function ChatWindow({
  chat,
  messages,
  currentUserId,
  partner,
  isTyping = false,
  isPartnerTyping = false,
  partnerTypingName = '',
  onSendMessage,
  onBack,
  isLoading = false,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Message Actions state
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const reactToMessage = useChatStore((state) => state.reactToMessage);
  const unsendMessage = useChatStore((state) => state.unsendMessage);
  const editMessage = useChatStore((state) => state.editMessage);

  // Reset actions when switching conversations
  useEffect(() => {
    setActiveMenuMessageId(null);
    setReplyingTo(null);
    setEditingMessage(null);
  }, [chat?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isPartnerTyping]);

  const handleReact = (msgId: string, emoji: string) => {
    if (!chat) return;
    reactToMessage(chat.id, msgId, currentUserId, emoji);
  };

  const handleReply = (msg: Message) => {
    setEditingMessage(null);
    setReplyingTo(msg);
  };

  const handleEdit = (msg: Message) => {
    setReplyingTo(null);
    setEditingMessage(msg);
  };

  const handleUnsend = async (msgId: string) => {
    if (!chat) return;
    try {
      await unsendMessage(chat.id, msgId, currentUserId);
      toast.success('Message unsent.');
      if (replyingTo?.id === msgId) setReplyingTo(null);
      if (editingMessage?.id === msgId) setEditingMessage(null);
    } catch (err: any) {
      toast.error(err.message || 'Could not unsend message.');
    }
  };

  const handleSaveEdit = async (newContent: string) => {
    if (!chat || !editingMessage) return;
    try {
      await editMessage(chat.id, editingMessage.id, currentUserId, newContent);
      toast.success('Message updated.');
      setEditingMessage(null);
    } catch (err: any) {
      toast.error(err.message || 'Could not edit message.');
    }
  };

  const handleJumpToReply = (targetId: string) => {
    const el = messageRefs.current.get(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(targetId);
      setTimeout(() => {
        setHighlightedMessageId((cur) => (cur === targetId ? null : cur));
      }, 1800);
    }
  };

  if (!chat) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-neutral-50)', color: 'var(--color-neutral-400)', padding: '2rem' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select a conversation to start chatting</p>
      </div>
    );
  }

  const effectivePartner: User = partner || (chat as any).otherParticipant || {
    id: chat.participants.find((p) => p !== currentUserId) || 'user-unknown',
    fullName: (chat as any).title || 'Neighbor',
    email: 'neighbor@example.com',
    avatar: '',
    role: 'user',
    isVerified: true,
    account_status: 'APPROVED',
    facial_verification_status: 'PASSED',
    id_verification_status: 'VERIFIED',
    verificationStatus: 'APPROVED',
    isTrusted: true,
    isSuspended: false,
    rating: 5.0,
    totalRatings: 1,
    totalExchanges: 0,
    totalDonations: 1,
    badges: [],
    joinedAt: new Date().toISOString(),
    lastActive: (chat as any).otherParticipant?.lastActive || new Date().toISOString(),
    isOnline: (chat as any).otherParticipant?.isOnline,
  };

  const presence = getPresenceInfo(
    effectivePartner.lastActive,
    (effectivePartner as any).isOnline
  );

  return (
    <>
      {/* Lightbox */}
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: '#fff',
          overflow: 'hidden',
        }}
        onClick={() => {
          // Clicking anywhere in chat window closes any active 3-dot menu
          if (activeMenuMessageId) setActiveMenuMessageId(null);
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid var(--color-neutral-200)',
            backgroundColor: '#fff',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.375rem',
                  border: 'none',
                  background: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-neutral-600)',
                  cursor: 'pointer',
                }}
                aria-label="Back to conversations"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <Avatar
              src={effectivePartner.avatar}
              name={effectivePartner.fullName}
              size="sm"
              showStatus
              isOnline={presence.isOnline}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.875rem', margin: 0 }}>{effectivePartner.fullName}</h3>
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: presence.isOnline ? '#16a34a' : 'var(--color-neutral-500)',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginTop: '0.125rem',
                }}
              >
                {presence.isOnline && (
                  <span
                    style={{
                      width: '0.4375rem',
                      height: '0.4375rem',
                      borderRadius: '9999px',
                      backgroundColor: '#22c55e',
                      display: 'inline-block',
                      boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)',
                    }}
                  />
                )}
                {presence.statusText}
              </span>
            </div>
          </div>
        </div>

        {/* Message List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            backgroundColor: 'var(--color-neutral-50)',
          }}
        >
          {isLoading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--color-neutral-400)' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  border: '3px solid var(--color-neutral-200)',
                  borderTopColor: 'var(--color-primary-600)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-400)', padding: '2rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>No messages yet. Send a message to start chatting!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMe={msg.senderId === currentUserId}
                partner={partner}
                currentUserId={currentUserId}
                isMenuOpen={activeMenuMessageId === msg.id}
                onOpenMenu={() => setActiveMenuMessageId(msg.id)}
                onCloseMenu={() => setActiveMenuMessageId((cur) => (cur === msg.id ? null : cur))}
                onImageClick={(url) => setLightboxSrc(url)}
                onReact={(emoji) => handleReact(msg.id, emoji)}
                onReply={() => handleReply(msg)}
                onEdit={() => handleEdit(msg)}
                onUnsend={() => handleUnsend(msg.id)}
                onJumpToReply={handleJumpToReply}
                isHighlighted={highlightedMessageId === msg.id}
                messageRefCallback={(el) => {
                  if (el) messageRefs.current.set(msg.id, el);
                  else messageRefs.current.delete(msg.id);
                }}
              />
            ))
          )}

          {(isPartnerTyping || isTyping) && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.5rem 0.875rem',
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                alignSelf: 'flex-start',
                marginTop: '0.25rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', fontWeight: 500 }}>
                {partnerTypingName || effectivePartner.fullName} is typing
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" />
              </span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <MessageInput
          chatId={chat.id}
          onSendMessage={onSendMessage}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
          onSaveEdit={handleSaveEdit}
        />
      </div>
    </>
  );
}
