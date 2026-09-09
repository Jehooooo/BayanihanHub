import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Reply, Trash2, Edit3, Smile } from 'lucide-react';
import ReactionPicker from './ReactionPicker';
import type { Message } from '@/types';

interface MessageActionMenuProps {
  message: Message;
  isMe: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit?: () => void;
  onUnsend?: () => void;
}

export default function MessageActionMenu({
  message,
  isMe,
  isOpen,
  onOpen,
  onClose,
  onReact,
  onReply,
  onEdit,
  onUnsend,
}: MessageActionMenuProps) {
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    if (!isOpen) {
      setShowPicker(false);
      return;
    }

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Don't show action menu for unsent messages
  if (message.isUnsent) {
    return null;
  }

  // Determine if editable/unsendable: sender only and message within 5 minutes
  const messageAgeMinutes = (Date.now() - new Date(message.createdAt).getTime()) / (1000 * 60);
  const canModify = isMe && messageAgeMinutes <= 5;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {/* 3-dot trigger button */}
      <button
        type="button"
        title="Message actions"
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) {
            onClose();
          } else {
            onOpen();
          }
        }}
        style={{
          width: '1.75rem',
          height: '1.75rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          backgroundColor: isOpen ? '#f3f4f6' : 'transparent',
          color: isOpen ? '#1f2937' : '#9ca3af',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        className="hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700"
      >
        <MoreHorizontal size={16} />
      </button>

      {/* Floating Reaction Picker */}
      {isOpen && showPicker && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            [isMe ? 'right' : 'left']: 0,
            marginBottom: '0.5rem',
            zIndex: 50,
          }}
        >
          <ReactionPicker
            onSelectReaction={(emoji) => {
              onReact(emoji);
              setShowPicker(false);
              onClose();
            }}
          />
        </div>
      )}

      {/* Action Dropdown Menu */}
      {isOpen && !showPicker && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            [isMe ? 'right' : 'left']: 0,
            marginBottom: '0.375rem',
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            padding: '0.25rem',
            minWidth: '9.5rem',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem',
          }}
          className="animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Reaction Bar in top of menu */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0.375rem 0.25rem',
              borderBottom: '1px solid #f3f4f6',
              marginBottom: '0.125rem',
            }}
          >
            {['❤️', '😂', '😮', '😢', '😡', '👍'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onReact(emoji);
                  onClose();
                }}
                style={{
                  fontSize: '1.125rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.125rem',
                  lineHeight: 1,
                  borderRadius: '9999px',
                }}
                className="hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply */}
          <button
            type="button"
            onClick={() => {
              onReply();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem 0.625rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#374151',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            className="hover:bg-neutral-50"
          >
            <Reply size={15} className="text-neutral-500" />
            <span>Reply</span>
          </button>

          {/* Edit (sender within 5 min, text only) */}
          {canModify && message.type === 'text' && onEdit && (
            <button
              type="button"
              onClick={() => {
                onEdit();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.5rem 0.625rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#374151',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              className="hover:bg-neutral-50"
            >
              <Edit3 size={15} className="text-neutral-500" />
              <span>Edit</span>
            </button>
          )}

          {/* Unsend (sender within 5 min) */}
          {canModify && onUnsend && (
            <button
              type="button"
              onClick={() => {
                onUnsend();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.5rem 0.625rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#dc2626',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              className="hover:bg-red-50"
            >
              <Trash2 size={15} className="text-red-500" />
              <span>Unsend</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
