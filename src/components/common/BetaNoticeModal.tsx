import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Users,
  Mail,
  Video,
  Camera,
  FileText,
  RotateCcw,
  HeartHandshake,
  X,
  Info,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSettingsStore } from '@/stores/settingsStore';

interface BetaNoticeModalProps {
  onClose?: () => void;
}

export default function BetaNoticeModal({ onClose }: BetaNoticeModalProps) {
  // Always defaults to true on every page load and refresh (no persistent storage)
  const [isOpen, setIsOpen] = useState(true);
  const okayButtonRef = useRef<HTMLButtonElement | null>(null);

  // Theme detection
  const { appearance } = useSettingsStore();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (appearance?.theme === 'dark') return true;
    if (appearance?.theme === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    if (appearance?.theme === 'dark') {
      setIsDark(true);
    } else if (appearance?.theme === 'light') {
      setIsDark(false);
    } else {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(media.matches);
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [appearance?.theme]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // Keyboard escape key support and initial focus
  useEffect(() => {
    if (!isOpen) return;

    // Focus Okay button for accessibility
    const timer = setTimeout(() => {
      okayButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="beta-notice-title"
      aria-describedby="beta-notice-desc"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 200ms ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '36rem',
          maxHeight: 'min(92vh, 680px)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderRadius: '1.25rem',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(139, 92, 246, 0.3)'
            : '0 25px 50px -12px rgba(124, 58, 237, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: isDark
            ? '1px solid rgba(139, 92, 246, 0.35)'
            : '1px solid rgba(139, 92, 246, 0.22)',
          overflow: 'hidden',
          animation: 'slideUp 220ms ease-out',
        }}
      >
        {/* Top Accent Gradient Bar */}
        <div
          style={{
            height: '0.375rem',
            background: 'linear-gradient(90deg, #7c3aed 0%, #6366f1 50%, #10b981 100%)',
            flexShrink: 0,
          }}
        />

        {/* Modal Header */}
        <div
          style={{
            padding: '1.125rem 1.25rem 0.875rem 1.25rem',
            borderBottom: isDark ? '1px solid #27272a' : '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            backgroundColor: isDark ? '#1e1b4b' : '#faf5ff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* SVG Beta / Community Icon */}
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
                flexShrink: 0,
              }}
            >
              <Sparkles style={{ width: '1.25rem', height: '1.25rem' }} aria-hidden="true" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    backgroundColor: isDark ? 'rgba(124, 58, 237, 0.25)' : '#ede9fe',
                    color: isDark ? '#c4b5fd' : '#6d28d9',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    border: isDark ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid #ddd6fe',
                  }}
                >
                  Beta Release
                </span>
              </div>
              <h2
                id="beta-notice-title"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: isDark ? '#f8fafc' : '#0f172a',
                  margin: '0.15rem 0 0 0',
                  letterSpacing: '-0.02em',
                }}
              >
                BayanihanHub Beta Testing
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close beta notice"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: isDark ? '#27272a' : '#f3f4f6',
              color: isDark ? '#a1a1aa' : '#6b7280',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#3f3f46' : '#e5e7eb';
              e.currentTarget.style.color = isDark ? '#ffffff' : '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#f3f4f6';
              e.currentTarget.style.color = isDark ? '#a1a1aa' : '#6b7280';
            }}
          >
            <X style={{ width: '1.125rem', height: '1.125rem' }} aria-hidden="true" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          id="beta-notice-desc"
          style={{
            padding: '1.125rem 1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            fontSize: '0.875rem',
            lineHeight: 1.55,
            color: isDark ? '#cbd5e1' : '#334155',
          }}
        >
          {/* Main Notice Callout */}
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: isDark ? 'rgba(124, 58, 237, 0.12)' : '#fbf8ff',
              borderRadius: '0.75rem',
              border: isDark ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid #e9d5ff',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info
                style={{ width: '1.125rem', height: '1.125rem', color: '#7c3aed', flexShrink: 0 }}
                aria-hidden="true"
              />
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  color: isDark ? '#e9d5ff' : '#6b21a8',
                  fontSize: '0.9375rem',
                }}
              >
                This deployment of BayanihanHub is currently for beta testing.
              </p>
            </div>
            <p
              style={{
                margin: 0,
                color: isDark ? '#c4b5fd' : '#581c87',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
              }}
            >
              You may encounter bugs, errors, unexpected behavior, or features that still need improvement while using the platform.
            </p>
          </div>

          {/* Development Team Contacts Block */}
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              backgroundColor: isDark ? '#27272a' : '#f8fafc',
              border: isDark ? '1px solid #3f3f46' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              <Users
                style={{ width: '1rem', height: '1rem', color: '#7c3aed', flexShrink: 0 }}
                aria-hidden="true"
              />
              <span>
                If you encounter any bug or error, please report it to any member of the development team:
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.1rem 0' }}>
              {['Jehosue', 'Christopher', 'Laurice', 'Trisha', 'Leah'].map((name) => (
                <span
                  key={name}
                  style={{
                    backgroundColor: isDark ? 'rgba(124, 58, 237, 0.25)' : '#ffffff',
                    border: isDark ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid #d8b4fe',
                    color: isDark ? '#e9d5ff' : '#6b21a8',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {name}
                </span>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.25rem',
                fontSize: '0.78125rem',
                flexWrap: 'wrap',
              }}
            >
              <Mail
                style={{ width: '0.9rem', height: '0.9rem', color: '#7c3aed', flexShrink: 0 }}
                aria-hidden="true"
              />
              <span style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                You may also report the problem through the designated team email:
              </span>
              <a
                href="mailto:jbiscarra24113423@student.dmmmsu.edu.ph"
                style={{
                  color: '#7c3aed',
                  fontWeight: 700,
                  textDecoration: 'none',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}
              >
                jbiscarra24113423@student.dmmmsu.edu.ph
              </a>
            </div>
          </div>

          {/* Attachment Checklist Box (Using SVGs, No Emojis) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: '0.8125rem',
              }}
            >
              When reporting a problem, please feel free to attach:
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: isDark ? '#27272a' : '#f9fafb',
                  borderRadius: '0.5rem',
                  border: isDark ? '1px solid #3f3f46' : '1px solid #f3f4f6',
                  fontSize: '0.78125rem',
                  color: isDark ? '#e2e8f0' : '#374151',
                }}
              >
                <Video
                  style={{ width: '1rem', height: '1rem', color: '#7c3aed', flexShrink: 0 }}
                  aria-hidden="true"
                />
                <span>A video recording of the problem</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: isDark ? '#27272a' : '#f9fafb',
                  borderRadius: '0.5rem',
                  border: isDark ? '1px solid #3f3f46' : '1px solid #f3f4f6',
                  fontSize: '0.78125rem',
                  color: isDark ? '#e2e8f0' : '#374151',
                }}
              >
                <Camera
                  style={{ width: '1rem', height: '1rem', color: '#7c3aed', flexShrink: 0 }}
                  aria-hidden="true"
                />
                <span>A screenshot or photo</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: isDark ? '#27272a' : '#f9fafb',
                  borderRadius: '0.5rem',
                  border: isDark ? '1px solid #3f3f46' : '1px solid #f3f4f6',
                  fontSize: '0.78125rem',
                  color: isDark ? '#e2e8f0' : '#374151',
                }}
              >
                <FileText
                  style={{ width: '1rem', height: '1rem', color: '#7c3aed', flexShrink: 0 }}
                  aria-hidden="true"
                />
                <span>Detailed information about what happened</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: isDark ? '#27272a' : '#f9fafb',
                  borderRadius: '0.5rem',
                  border: isDark ? '1px solid #3f3f46' : '1px solid #f3f4f6',
                  fontSize: '0.78125rem',
                  color: isDark ? '#e2e8f0' : '#374151',
                }}
              >
                <RotateCcw
                  style={{ width: '1rem', height: '1rem', color: '#7c3aed', flexShrink: 0 }}
                  aria-hidden="true"
                />
                <span>The steps you took before the problem occurred</span>
              </div>
            </div>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              color: isDark ? '#94a3b8' : '#64748b',
            }}
          >
            Your feedback will help us identify problems, improve BayanihanHub, and prepare the platform for its full release.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.625rem 0.875rem',
              backgroundColor: isDark ? 'rgba(124, 58, 237, 0.2)' : '#f5f3ff',
              borderRadius: '0.5rem',
              border: isDark ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid #ede9fe',
              color: isDark ? '#d8b4fe' : '#6d28d9',
              fontWeight: 700,
              fontSize: '0.8125rem',
            }}
          >
            <HeartHandshake
              style={{ width: '1.125rem', height: '1.125rem', color: '#7c3aed', flexShrink: 0 }}
              aria-hidden="true"
            />
            <span>Thank you for helping us test BayanihanHub.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.875rem 1.25rem',
            backgroundColor: isDark ? '#18181b' : '#fafafa',
            borderTop: isDark ? '1px solid #27272a' : '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          <Button
            ref={okayButtonRef}
            variant="primary"
            size="md"
            onClick={handleClose}
            style={{
              minWidth: '7.5rem',
              backgroundColor: '#7c3aed',
              borderColor: '#7c3aed',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
            }}
          >
            Okay
          </Button>
        </div>
      </div>
    </div>
  );
}
