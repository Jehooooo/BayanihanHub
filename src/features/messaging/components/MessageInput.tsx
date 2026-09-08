import { useState, useRef } from 'react';
import { Send, Paperclip, Smile, X, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export interface SendMessagePayload {
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

interface MessageInputProps {
  chatId?: string;
  onSendMessage: (payload: SendMessagePayload) => void;
}

const COMMON_EMOJIS = [
  '😊', '😂', '👍', '❤️', '🙏', '👋',
  '🎉', '✨', '🤝', '📦', '✅', '⭐',
  '🙌', '💡', '🔥', '💯', '🌸', '💬',
];

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']);

interface AttachmentState {
  file: File;
  name: string;
  mimeType: string;
  isImage: boolean;
  /** local object URL for preview before upload */
  previewUrl: string;
  /** public URL returned from backend after upload */
  uploadedUrl?: string;
}

export default function MessageInput({ chatId, onSendMessage }: MessageInputProps) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<AttachmentState | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;

    // If we have an attachment that hasn't been uploaded yet, upload first
    if (attachment && !attachment.uploadedUrl) {
      toast.error('File is still uploading — please wait a moment.');
      return;
    }

    const payload: SendMessagePayload = {
      content: trimmed || (attachment ? `Sent ${attachment.isImage ? 'an image' : 'a file'}: ${attachment.name}` : ''),
      type: attachment ? (attachment.isImage ? 'image' : 'file') : 'text',
      fileUrl: attachment?.uploadedUrl,
      fileName: attachment?.name,
    };

    onSendMessage(payload);
    setText('');
    setAttachment(null);
    setShowEmojiPicker(false);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = IMAGE_MIMES.has(file.type);
    const previewUrl = URL.createObjectURL(file);

    setAttachment({ file, name: file.name, mimeType: file.type, isImage, previewUrl });
    e.target.value = '';

    // Upload immediately while user types their caption
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const convId = chatId || 'general';
      const res = await fetch(`/api/conversations/${encodeURIComponent(convId)}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAttachment((prev) => prev ? { ...prev, uploadedUrl: data.url } : null);
        toast.success(`${isImage ? 'Image' : 'File'} ready to send!`);
      } else {
        toast.error('Upload failed — try again.');
        setAttachment(null);
      }
    } catch {
      toast.error('Upload failed — check your connection.');
      setAttachment(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setText((prev) => prev + emoji);
    textInputRef.current?.focus();
  };

  const handleRemoveAttachment = () => {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
  };

  const canSend = (text.trim() || attachment) && !isUploading && (!attachment || !!attachment.uploadedUrl);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
            {/* Thumbnail for images, icon for other files */}
            {attachment.isImage ? (
              <img
                src={attachment.previewUrl}
                alt="preview"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  objectFit: 'cover',
                  borderRadius: '0.375rem',
                  flexShrink: 0,
                  border: '1px solid var(--color-primary-200)',
                }}
              />
            ) : (
              <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary-600)', flexShrink: 0 }} />
            )}
            <div style={{ overflow: 'hidden' }}>
              <span style={{ display: 'block', fontWeight: 600, color: 'var(--color-primary-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {attachment.name}
              </span>
              <span style={{ color: 'var(--color-primary-600)', fontSize: '0.6875rem' }}>
                {isUploading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Loader2 style={{ width: '0.75rem', height: '0.75rem', animation: 'spin 1s linear infinite' }} />
                    Uploading...
                  </span>
                ) : attachment.uploadedUrl ? '✓ Ready to send' : 'Waiting...'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveAttachment}
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
              flexShrink: 0,
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
        {/* Paperclip Button */}
        <button
          type="button"
          onClick={handleFileClick}
          disabled={isUploading}
          style={{
            padding: '0.5rem',
            color: attachment ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
            backgroundColor: attachment ? 'var(--color-primary-50)' : 'transparent',
            border: 'none',
            borderRadius: '9999px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            if (!isUploading) {
              e.currentTarget.style.color = 'var(--color-primary-600)';
              e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
            }
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
          {isUploading ? (
            <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Paperclip style={{ width: '1.25rem', height: '1.25rem' }} />
          )}
        </button>

        {/* Emoji Button */}
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
          aria-label="Emoji picker"
          title="Add emoji"
        >
          <Smile style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>

        <input
          ref={textInputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={attachment ? 'Add a caption (optional)...' : 'Type a message...'}
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
          disabled={!canSend}
          style={{
            width: '2.375rem',
            height: '2.375rem',
            borderRadius: '9999px',
            backgroundColor: canSend ? 'var(--color-primary-600)' : 'var(--color-neutral-300)',
            color: '#fff',
            border: 'none',
            cursor: canSend ? 'pointer' : 'default',
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
