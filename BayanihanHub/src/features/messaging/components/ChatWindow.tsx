import { useRef, useEffect } from 'react';
import Avatar from '@/components/ui/Avatar';
import MessageInput from './MessageInput';
import type { Chat, Message, User } from '@/types';

interface ChatWindowProps {
  chat: Chat | null;
  messages: Message[];
  currentUserId: string;
  partner?: User;
  isTyping?: boolean;
  onSendMessage: (content: string) => void;
}

export default function ChatWindow({
  chat,
  messages,
  currentUserId,
  partner,
  isTyping = false,
  onSendMessage,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!chat || !partner) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-neutral-50)', color: 'var(--color-neutral-400)', padding: '2rem' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-neutral-50)', minWidth: 0, overflow: 'hidden' }}>
      {/* Chat Header */}
      <div style={{ padding: '0.875rem 1.25rem', backgroundColor: '#fff', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Avatar src={partner.avatar} name={partner.fullName} size="sm" showStatus isOnline />
          <div>
            <h3 style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.875rem', margin: 0 }}>{partner.fullName}</h3>
            <span style={{ fontSize: '0.625rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', backgroundColor: '#22c55e', display: 'inline-block' }} /> Active Now
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
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
                  padding: '0.625rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.75rem',
                  lineHeight: '1.5',
                  boxShadow: 'var(--shadow-card)',
                  wordBreak: 'break-word',
                  backgroundColor: isMe ? 'var(--color-primary-600)' : '#fff',
                  color: isMe ? '#fff' : 'var(--color-neutral-900)',
                  border: isMe ? 'none' : '1px solid var(--color-neutral-200)',
                }}
              >
                <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.content}</p>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    display: 'block',
                    textAlign: 'right',
                    marginTop: '0.25rem',
                    fontWeight: 500,
                    color: isMe ? 'var(--color-primary-100)' : 'var(--color-neutral-400)',
                  }}
                >
                  10:31 AM
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontStyle: 'italic', padding: '0.25rem 0' }}>
            <span>{partner.fullName} is typing...</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Bar */}
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}

