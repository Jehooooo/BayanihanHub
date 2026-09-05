// ============================================================
// Bayanihan Hub — ID Document Uploader Component
// ============================================================

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { validateIdDocumentFile } from '@/services/verification.service';

interface IdDocumentUploaderProps {
  idType: string;
  documentDataUrl?: string;
  onDocumentChange: (dataUrl: string, file?: File) => void;
}

export default function IdDocumentUploader({
  idType,
  documentDataUrl,
  onDocumentChange,
}: IdDocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    setErrorMessage(null);

    const validation = await validateIdDocumentFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file uploaded.');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onDocumentChange(result, file);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    onDocumentChange('', undefined);
    setFileName('');
    setFileSize('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Information Banner */}
      <div
        style={{
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(232, 245, 233, 0.7)',
          border: '1px solid var(--color-primary-200)',
          display: 'flex',
          gap: '0.75rem',
        }}
      >
        <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary-700)', flexShrink: 0, marginTop: '0.125rem' }} />
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-900)', margin: 0 }}>
            Identity Verification
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-primary-800)', margin: '0.25rem 0 0 0', lineHeight: 1.5 }}>
            Your valid ID is required to verify your identity and keep the Bayanihan Hub community safe. We strictly protect your identity records and mask sensitive numbers.
          </p>
        </div>
      </div>

      {/* Upload Box or Preview Card */}
      {!documentDataUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--color-primary-600)' : 'var(--color-neutral-300)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            backgroundColor: isDragging ? 'var(--color-primary-50)' : '#fff',
            cursor: 'pointer',
            transition: 'all 150ms ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Upload style={{ width: '1.75rem', height: '1.75rem' }} />
          </div>

          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              Click to upload or drag & drop your {idType || 'Valid ID'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>
              Accepted formats: JPG, PNG, WebP, or PDF (Max 10MB)
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.6875rem',
              color: 'var(--color-neutral-500)',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--color-neutral-100)',
            }}
          >
            <span>✓ Lay on flat surface</span>
            <span>✓ No flash glare</span>
            <span>✓ All 4 corners visible</span>
          </div>
        </div>
      ) : (
        /* Preview Card */
        <div
          style={{
            border: '1px solid var(--color-neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle style={{ width: '1.125rem', height: '1.125rem', color: 'var(--color-success)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {idType} Uploaded
              </span>
              {fileSize && (
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>
                  ({fileSize})
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              leftIcon={<X style={{ width: '0.875rem', height: '0.875rem' }} />}
              style={{ color: 'var(--color-danger)', borderColor: '#fecaca' }}
            >
              Remove & Re-upload
            </Button>
          </div>

          {/* Document Preview Thumbnail */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: 'var(--color-neutral-100)',
              border: '1px solid var(--color-neutral-200)',
              maxHeight: '16rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {documentDataUrl.startsWith('data:image') || documentDataUrl.startsWith('http') ? (
              <img
                src={documentDataUrl}
                alt="Uploaded ID preview"
                style={{
                  width: '100%',
                  maxHeight: '16rem',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <FileText style={{ width: '3rem', height: '3rem', color: 'var(--color-primary-600)' }} />
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: 0 }}>
                  {fileName || 'PDF Document Attached'}
                </p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
                  Ready for verification check
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Feedback */}
      {errorMessage && (
        <div
          style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: 'var(--color-danger)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
