import React from 'react';
import type { MessageReaction } from '@/types';

interface ReactionDisplayProps {
  reactions?: MessageReaction[];
  currentUserId: string;
  onToggleReaction: (emoji: string) => void;
  isMe?: boolean;
}

export default function ReactionDisplay({
  reactions = [],
  currentUserId,
  onToggleReaction,
  isMe = false,
}: ReactionDisplayProps) {
  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const grouped = reactions.reduce<Record<string, { count: number; hasMe: boolean; userIds: string[] }>>(
    (acc, item) => {
      if (!acc[item.reaction]) {
        acc[item.reaction] = { count: 0, hasMe: false, userIds: [] };
      }
      acc[item.reaction].count += 1;
      acc[item.reaction].userIds.push(item.userId);
      if (item.userId === currentUserId) {
        acc[item.reaction].hasMe = true;
      }
      return acc;
    },
    {}
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.25rem',
        marginTop: '-0.375rem',
        marginBottom: '0.25rem',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        position: 'relative',
        zIndex: 10,
        padding: '0 0.5rem',
      }}
    >
      {Object.entries(grouped).map(([emoji, data]) => {
        const tooltip = data.hasMe
          ? data.count === 1
            ? 'You reacted'
            : `You and ${data.count - 1} other${data.count > 2 ? 's' : ''}`
          : `${data.count} reaction${data.count > 1 ? 's' : ''}`;

        return (
          <button
            key={emoji}
            type="button"
            title={tooltip}
            onClick={(e) => {
              e.stopPropagation();
              onToggleReaction(emoji);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.125rem 0.375rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              lineHeight: 1,
              backgroundColor: data.hasMe ? '#eff6ff' : '#ffffff',
              border: data.hasMe ? '1.5px solid #3b82f6' : '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.15s ease',
            }}
            className="hover:scale-105 active:scale-95"
          >
            <span style={{ fontSize: '0.8125rem' }}>{emoji}</span>
            {data.count > 1 && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: data.hasMe ? '#1d4ed8' : '#4b5563',
                }}
              >
                {data.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
