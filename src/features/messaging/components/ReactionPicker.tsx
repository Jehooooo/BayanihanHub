import React from 'react';

export const EMOJI_REACTIONS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '👍', label: 'Like' },
];

interface ReactionPickerProps {
  onSelectReaction: (emoji: string) => void;
  userReaction?: string;
  className?: string;
}

export default function ReactionPicker({
  onSelectReaction,
  userReaction,
  className = '',
}: ReactionPickerProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-white dark:bg-neutral-800 rounded-full shadow-lg border border-neutral-200 dark:border-neutral-700 animate-in fade-in zoom-in-95 duration-150 z-30 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {EMOJI_REACTIONS.map(({ emoji, label }) => {
        const isSelected = userReaction === emoji;
        return (
          <button
            key={emoji}
            type="button"
            title={label}
            onClick={(e) => {
              e.stopPropagation();
              onSelectReaction(emoji);
            }}
            className={`w-8 h-8 flex items-center justify-center text-lg rounded-full transition-transform hover:scale-130 active:scale-110 select-none ${
              isSelected ? 'bg-primary-50 dark:bg-primary-900/40 ring-2 ring-primary-500' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}
