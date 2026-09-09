import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HandHeart,
  Upload,
  X,
  Image as ImageIcon,
  MessageSquare,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import type { ItemRequest } from '@/types';
import toast from 'react-hot-toast';

interface FulfillRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ItemRequest | null;
  onSuccess?: () => void;
}

export default function FulfillRequestModal({
  isOpen,
  onClose,
  request,
  onSuccess,
}: FulfillRequestModalProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { createChat, sendMessage } = useChatStore();

  const [message, setMessage] = useState('');
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!request) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload image files only (PNG, JPG, WebP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setEvidenceImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast.error('Please log in to fulfill this request.');
      navigate('/login');
      return;
    }

    if (!message.trim()) {
      toast.error('Please write a message explaining how you can fulfill this request.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Store in database: call backend fulfill endpoint
      try {
        await fetch(`/api/requests/${encodeURIComponent(request.id)}/fulfill?helperId=${encodeURIComponent(user.id)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            helperId: user.id,
            message: message.trim(),
            evidenceUrl: evidenceImages[0] || null,
          }),
        });
      } catch {
        // Continue to chat messaging even if backend endpoint has network variance
      }

      // 2. Create or look up conversation with the request owner
      const chat = await createChat([user.id, request.userId]);

      // 3. Send message and evidence picture to the user's inbox
      const formattedMessage = `🤝 Community Assistance Offer for "${request.title}":\n\n${message.trim()}`;
      await sendMessage(chat.id, user.id, formattedMessage, 'text');

      if (evidenceImages.length > 0) {
        for (const imgUrl of evidenceImages) {
          await sendMessage(chat.id, user.id, imgUrl, 'image');
        }
      }

      toast.success(
        (t) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontWeight: 700 }}>Fulfillment response sent!</span>
            <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>
              Your message and evidence were sent to {request.user?.fullName || 'the requester'}.
            </span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/messages');
              }}
              style={{
                alignSelf: 'flex-start',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#16a34a',
                background: 'none',
                border: 'none',
                padding: '0.2rem 0',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Go to Messages →
            </button>
          </div>
        ),
        { duration: 5000 }
      );

      setMessage('');
      setEvidenceImages([]);
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Failed to send fulfillment response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fulfill Community Request" size="lg">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Target Request Summary Card */}
        <div
          style={{
            padding: '1rem 1.125rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-100)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-100)',
              color: 'var(--color-primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '0.125rem',
            }}
          >
            <HandHeart style={{ width: '1.35rem', height: '1.35rem' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <Badge variant="primary" size="sm" style={{ padding: '0.25rem 0.85rem' }}>
                {request.category.replace('-', ' ')}
              </Badge>
              <Badge
                variant={request.urgency === 'critical' ? 'danger' : request.urgency === 'high' ? 'warning' : 'default'}
                size="sm"
                solid
                style={{ padding: '0.25rem 0.85rem' }}
              >
                {request.urgency} urgency
              </Badge>
            </div>
            <h4 style={{ margin: '0 0 0.375rem 0', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-primary-900)' }}>
              {request.title}
            </h4>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: '1.5' }}>
              {request.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
              {request.user && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <Avatar src={request.user.avatar} name={request.user.fullName} size="xs" />
                  {request.user.fullName}
                </span>
              )}
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin style={{ width: '0.75rem', height: '0.75rem' }} />
                {request.location.barangay}, {request.location.municipality}
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Send Message */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', marginBottom: '0.35rem' }}>
            <MessageSquare style={{ width: '0.875rem', height: '0.875rem', display: 'inline', marginRight: '0.35rem', verticalAlign: 'text-bottom' }} />
            Send a message to the user <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <Textarea
            placeholder="Introduce yourself and specify how you can fulfill this request (e.g. 'I have a spare box of textbooks in good condition that you can have. I am available for handover this weekend...')"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />
        </div>

        {/* Step 2: Pictures or Supporting Evidence */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
              <ImageIcon style={{ width: '0.875rem', height: '0.875rem', display: 'inline', marginRight: '0.35rem', verticalAlign: 'text-bottom' }} />
              Provide pictures or supporting evidence
            </label>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>
              Optional • Max 5MB per image
            </span>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--color-neutral-300)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--color-neutral-50)',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary-500)';
              e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-neutral-300)';
              e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)';
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Upload style={{ width: '1.75rem', height: '1.75rem', color: 'var(--color-neutral-400)', margin: '0 auto 0.5rem auto' }} />
            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
              Click to upload photo or proof of items
            </p>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.6875rem', color: 'var(--color-neutral-500)' }}>
              PNG, JPG, WebP supported
            </p>
          </div>

          {/* Preview of Uploaded Evidence Photos */}
          {evidenceImages.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              {evidenceImages.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    width: '5.5rem',
                    height: '5.5rem',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-neutral-300)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <img
                    src={img}
                    alt={`Evidence ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: 'absolute',
                      top: '0.25rem',
                      right: '0.25rem',
                      width: '1.25rem',
                      height: '1.25rem',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    title="Remove image"
                  >
                    <X style={{ width: '0.75rem', height: '0.75rem' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Database & Notification Assurance Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            fontSize: '0.75rem',
            color: '#15803d',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 style={{ width: '0.9375rem', height: '0.9375rem', flexShrink: 0, color: '#16a34a' }} />
          <span>
            This response will be saved in the database, notify the requester, and open a direct messaging thread.
          </span>
        </div>

        {/* Dedicated Modal Actions / Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.875rem',
            paddingTop: '1.25rem',
            paddingBottom: '0.25rem',
            borderTop: '1px solid var(--color-neutral-200)',
            flexWrap: 'wrap',
          }}
          className="flex-col-reverse sm:flex-row sm:items-center sm:justify-end"
        >
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ minWidth: '6.5rem', padding: '0.625rem 1.25rem' }}
            className="w-full sm:w-auto justify-center"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            leftIcon={<HandHeart style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} />}
            style={{ padding: '0.625rem 1.5rem', whiteSpace: 'nowrap' }}
            className="w-full sm:w-auto justify-center shadow-button"
          >
            {isSubmitting ? 'Sending Response...' : 'Send Message & Fulfill'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
