import { useState, useRef } from 'react';
import { Upload, X, AlertCircle, Camera, CheckCircle2, RefreshCw } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { useProfilePictureStore } from '@/stores/profilePictureStore';
import toast from 'react-hot-toast';

interface ProfilePictureUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ProfilePictureUploadModal({ isOpen, onClose }: ProfilePictureUploadModalProps) {
  const { user } = useAuthStore();
  const { submitProfilePicture } = useProfilePictureStore();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    setFileError(null);

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Please select a valid image file (JPEG, PNG, WebP, or GIF).');
      toast.error('Invalid file type. Only JPEG, PNG, WebP, or GIF allowed.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError('File size exceeds the 5MB limit. Please choose a smaller image.');
      toast.error('File size too large. Max 5MB allowed.');
      return;
    }

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setPreviewUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!previewUrl || !user) {
      toast.error('Please select an image first.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 600));

      submitProfilePicture(user.id, previewUrl);
      toast.success('Profile picture submitted for admin review!');
      handleReset();
      onClose();
    } catch {
      toast.error('Failed to submit profile picture. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Upload Profile Picture"
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Info Note */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(236, 253, 245, 0.8)',
            border: '1px solid var(--color-primary-200)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
            fontSize: '0.75rem',
            color: 'var(--color-primary-800)',
          }}
        >
          <AlertCircle style={{ width: '1.1rem', height: '1.1rem', flexShrink: 0, marginTop: '0.1rem', color: 'var(--color-primary-600)' }} />
          <span>
            Uploaded photos are reviewed by administrators before being officially displayed across the community to maintain neighborhood trust.
          </span>
        </div>

        {/* Current & Preview comparison */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '1rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>Current</span>
            <Avatar src={user?.avatar} name={user?.fullName || 'User'} size="lg" />
          </div>

          <div style={{ fontSize: '1.25rem', color: 'var(--color-neutral-300)' }}>➔</div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary-700)', textTransform: 'uppercase' }}>New Preview</span>
            {previewUrl ? (
              <div style={{ position: 'relative', width: '3.5rem', height: '3.5rem', borderRadius: '9999px', overflow: 'hidden', border: '2px solid var(--color-primary-500)', boxShadow: '0 4px 12px rgba(22, 101, 52, 0.2)' }}>
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '9999px', border: '2px dashed var(--color-neutral-300)', backgroundColor: 'var(--color-neutral-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-400)' }}>
                <Camera style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
            )}
          </div>
        </div>

        {/* Upload Drop Zone */}
        {!previewUrl ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '2rem 1.5rem',
              border: `2px dashed ${isDragging ? 'var(--color-primary-500)' : 'var(--color-neutral-300)'}`,
              backgroundColor: isDragging ? '#f0fdf4' : 'var(--color-neutral-50)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 150ms ease-in-out',
            }}
          >
            <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', marginBottom: '0.75rem' }}>
              <Upload style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary-600)' }} />
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-neutral-900)' }}>
              Click to upload or drag and drop
            </p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
              PNG, JPG, WebP or GIF (Max 5MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 style={{ width: '1.1rem', height: '1.1rem', color: '#16a34a' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#166534' }}>New photo ready for submission</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-neutral-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              <RefreshCw style={{ width: '0.875rem', height: '0.875rem' }} /> Choose different
            </button>
          </div>
        )}

        {/* Error message if any */}
        {fileError && (
          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#991b1b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <X style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
            <span>{fileError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-neutral-100)' }}>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={!previewUrl || isSubmitting}
            isLoading={isSubmitting}
            onClick={handleSubmit}
            className="font-bold shadow-button px-5"
          >
            Submit for Approval
          </Button>
        </div>
      </div>
    </Modal>
  );
}
