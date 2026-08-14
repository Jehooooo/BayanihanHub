import { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '0.75rem 1rem',
        backgroundColor: '#fff',
        borderTop: '1px solid var(--color-neutral-200)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        style={{
          padding: '0.5rem',
          color: 'var(--color-neutral-400)',
          background: 'none',
          border: 'none',
          borderRadius: '9999px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Attach file"
      >
        <Paperclip style={{ width: '1.25rem', height: '1.25rem' }} />
      </button>

      <button
        type="button"
        style={{
          padding: '0.5rem',
          color: 'var(--color-neutral-400)',
          background: 'none',
          border: 'none',
          borderRadius: '9999px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Emoji picker"
      >
        <Smile style={{ width: '1.25rem', height: '1.25rem' }} />
      </button>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        style={{
          flex: 1,
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          backgroundColor: '#f1f5f3',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '9999px',
          outline: 'none',
          color: 'var(--color-neutral-900)',
        }}
        onFocus={(e) => {
          e.target.style.backgroundColor = '#fff';
          e.target.style.borderColor = 'var(--color-primary-500)';
        }}
        onBlur={(e) => {
          e.target.style.backgroundColor = '#f1f5f3';
          e.target.style.borderColor = 'var(--color-neutral-200)';
        }}
      />

      <button
        type="submit"
        disabled={!text.trim()}
        style={{
          width: '2.375rem',
          height: '2.375rem',
          borderRadius: '9999px',
          backgroundColor: text.trim() ? 'var(--color-primary-600)' : 'var(--color-neutral-300)',
          color: '#fff',
          border: 'none',
          cursor: text.trim() ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Send style={{ width: '1rem', height: '1rem' }} />
      </button>
    </form>
  );
}

