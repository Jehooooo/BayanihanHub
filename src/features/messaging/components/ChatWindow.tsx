import { useRef, useEffect, useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import MessageInput, { type SendMessagePayload } from './MessageInput';
import type { Chat, Message, User } from '@/types';

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
  onImageClick: (url: string) => void;
}

function MessageBubble({ msg, isMe, partner, onImageClick }: BubbleProps) {
  const hasImage = msg.type === 'image' || isImageUrl(msg.fileUrl);
  const hasFile = !hasImage && !!msg.fileUrl;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.625rem',
        width: '100%',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        paddingLeft: isMe ? '3rem' : 0,
        paddingRight: isMe ? 0 : '3rem',
      }}
    >
      {!isMe && partner && (
        <Avatar src={partner.avatar} name={partner.fullName} size="xs" style={{ flexShrink: 0, marginBottom: '0.125rem' }} />
      )}

      <div
        style={{
          maxWidth: '75%',
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.75rem',
          lineHeight: '1.5',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          backgroundColor: isMe ? 'var(--color-primary-600)' : '#fff',
          color: isMe ? '#fff' : 'var(--color-neutral-900)',
          border: isMe ? 'none' : '1px solid var(--color-neutral-200)',
        }}
      >
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
              borderBottom: msg.content && msg.content !== `Sent an image: ${msg.fileName}` && !msg.content.startsWith('Sent an image')
                ? `1px solid ${isMe ? 'rgba(255,255,255,0.15)' : 'var(--color-neutral-200)'}` : 'none',
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

        {/* Text content — hide generic "Sent an image" fallback if we already show the image */}
        {msg.content && !(hasImage && msg.content.startsWith('Sent an image')) && (
          <p style={{ margin: 0, wordBreak: 'break-word', padding: '0.625rem 1rem', paddingTop: hasImage || hasFile ? '0.375rem' : '0.625rem' }}>
            {msg.content}
          </p>
        )}

        {/* Timestamp */}
        <span
          style={{
            fontSize: '0.5625rem',
            display: 'block',
            textAlign: 'right',
            padding: '0 0.75rem 0.4rem',
            fontWeight: 500,
            color: isMe ? 'var(--color-primary-100)' : 'var(--color-neutral-400)',
          }}
        >
          {formatMessageTime(msg.createdAt)}
        </span>
      </div>
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
  onSendMessage,
  onBack,
  isLoading = false,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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
    lastActive: new Date().toISOString(),
  };

  return (
    <>
      {/* Lightbox */}
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-neutral-50)', minWidth: 0, overflow: 'hidden' }}>
        {/* Chat Header */}
        <div style={{ padding: '0.875rem 1.25rem', backgroundColor: '#fff', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="md:!hidden"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  marginRight: '0.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--color-neutral-600)',
                }}
                aria-label="Back to conversations"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <Avatar src={effectivePartner.avatar} name={effectivePartner.fullName} size="sm" showStatus isOnline />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.875rem', margin: 0 }}>{effectivePartner.fullName}</h3>
              </div>
              <span style={{ fontSize: '0.625rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', backgroundColor: '#22c55e', display: 'inline-block' }} /> Active Now
              </span>
            </div>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isLoading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--color-neutral-400)', minHeight: '12rem' }}>
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
                onImageClick={(url) => setLightboxSrc(url)}
              />
            ))
          )}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontStyle: 'italic', padding: '0.25rem 0' }}>
              <span>{effectivePartner.fullName} is typing...</span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <MessageInput chatId={chat.id} onSendMessage={onSendMessage} />
      </div>
    </>
  );
}
