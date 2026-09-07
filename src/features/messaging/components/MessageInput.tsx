import { useState, useRef } from 'react';
import { Send, Paperclip, Smile, X, Image as ImageIcon, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const COMMON_EMOJIS = [
  '😊', '😂', '👍', '❤️', '🙏', '👋',
  '🎉', '✨', '🤝', '📦', '✅', '⭐',
  '🙌', '💡', '🔥', '💯', '🌸', '💬',
];

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;

    let finalMessage = trimmed;
    if (attachment) {
      finalMessage = trimmed ? `${trimmed} 📎 [File: ${attachment.name}]` : `📎 [Attached: ${attachment.name}]`;
    }

    onSendMessage(finalMessage);
    setText('');
    setAttachment(null);
    setShowEmojiPicker(false);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment({
        name: file.name,
        type: file.type,
      });
      toast.success(`Attached: ${file.name}`);
    }
    // reset input so same file can be picked again if needed
    e.target.value = '';
  };

  const handleEmojiClick = (emoji: string) => {
    setText((prev) => prev + emoji);
    textInputRef.current?.focus();
  };

  return (
    <div style={{ position: 'relative', width: '100%', backgroundColor: '#fff', borderTop: '1px solid var(--color-neutral-200)', flexShrink: 0 }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {/* Attachment Preview Banner */}
      {attachment && (
        <div
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-primary-50)',
            borderBottom: '1px solid var(--color-primary-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-800)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {attachment.type.startsWith('image/') ? (
              <ImageIcon style={{ width: '1rem', height: '1rem', color: 'var(--color-primary-600)', flexShrink: 0 }} />
            ) : (
              <FileText style={{ width: '1rem', height: '1rem', color: 'var(--color-primary-600)', flexShrink: 0 }} />
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{attachment.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-neutral-400)',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
            }}
            title="Remove attachment"
          >
            <X style={{ width: '0.875rem', height: '0.875rem' }} />
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 30 }}
            onClick={() => setShowEmojiPicker(false)}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '1rem',
              marginBottom: '0.5rem',
              width: '15.5rem',
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-elevated)',
              border: '1px solid var(--color-neutral-200)',
              padding: '0.75rem',
              zIndex: 40,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              animation: 'scale-in 150ms ease-out',
            }}
          >
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Emojis
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.35rem' }}>
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  style={{
                    background: 'none',
                    border: '1px solid transparent',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.35rem',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 150ms, transform 100ms',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
                    e.currentTarget.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Input Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
        }}
      >
        {/* Clickable Paperclip Button */}
        <button
          type="button"
          onClick={handleFileClick}
          style={{
            padding: '0.5rem',
            color: attachment ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
            backgroundColor: attachment ? 'var(--color-primary-50)' : 'transparent',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-primary-600)';
            e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
          }}
          onMouseLeave={(e) => {
            if (!attachment) {
              e.currentTarget.style.color = 'var(--color-neutral-500)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          aria-label="Attach file"
          title="Attach file or photo"
        >
          <Paperclip style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>

        {/* Clickable Smiley Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{
            padding: '0.5rem',
            color: showEmojiPicker ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
            backgroundColor: showEmojiPicker ? 'var(--color-primary-50)' : 'transparent',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-primary-600)';
            e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
          }}
          onMouseLeave={(e) => {
            if (!showEmojiPicker) {
              e.currentTarget.style.color = 'var(--color-neutral-500)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          aria-label="Emoji and quick replies"
          title="Add emoji or quick reply"
        >
          <Smile style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>

        <input
          ref={textInputRef}
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
            transition: 'background-color 150ms, border-color 150ms',
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
          disabled={!text.trim() && !attachment}
          style={{
            width: '2.375rem',
            height: '2.375rem',
            borderRadius: '9999px',
            backgroundColor: (text.trim() || attachment) ? 'var(--color-primary-600)' : 'var(--color-neutral-300)',
            color: '#fff',
            border: 'none',
            cursor: (text.trim() || attachment) ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 150ms',
          }}
          aria-label="Send message"
        >
          <Send style={{ width: '1rem', height: '1rem' }} />
        </button>
      </form>
    </div>
  );
}

