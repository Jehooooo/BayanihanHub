import { useState, useEffect } from 'react';
import { X, Sparkles, Mail, Users, AlertCircle, Video, Camera, FileText, RefreshCw, Heart } from 'lucide-react';
import Button from '@/components/ui/Button';

interface BetaNoticeModalProps {
  /**
   * Scope identifier (e.g. 'login' or 'home') used for sessionStorage tracking
   * so the notice is displayed on each designated screen without duplicate popups.
   */
  scope: 'login' | 'home';
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function BetaNoticeModal({ scope, forceOpen = false, onClose }: BetaNoticeModalProps) {
  const storageKey = `bayanihanhub_beta_notice_${scope}_acknowledged`;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // Check if user has already acknowledged notice in this session for this specific scope
    try {
      const alreadySeen = sessionStorage.getItem(storageKey);
      if (!alreadySeen) {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }
  }, [storageKey, forceOpen]);

  const handleClose = () => {
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      // ignore
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="beta-notice-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'fadeIn 200ms ease-out',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '36rem',
          maxHeight: 'min(90vh, 640px)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          overflow: 'hidden',
          animation: 'slideUp 220ms ease-out',
        }}
      >
        {/* Decorative Top Accent Banner */}
        <div
          style={{
            height: '0.4rem',
            background: 'linear-gradient(90deg, #7c3aed 0%, #6366f1 50%, #10b981 100%)',
            flexShrink: 0,
          }}
        />

        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem 1rem 1.5rem',
            borderBottom: '1px solid var(--color-neutral-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            backgroundColor: '#faf5ff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                fontSize: '1.25rem',
                boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)',
                flexShrink: 0,
              }}
            >
              🧪
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    backgroundColor: '#f3e8ff',
                    color: '#7c3aed',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    border: '1px solid #e9d5ff',
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
                  color: 'var(--color-neutral-900)',
                  margin: '0.15rem 0 0 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Welcome to the BayanihanHub Beta Test
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
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
              e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <X style={{ width: '1.125rem', height: '1.125rem' }} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.125rem',
            fontSize: '0.875rem',
            lineHeight: 1.55,
            color: 'var(--color-neutral-700)',
          }}
        >
          {/* Main Notice Callout */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fbf8ff',
              borderRadius: '0.75rem',
              border: '1px solid #e9d5ff',
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, color: '#6b21a8', fontSize: '0.925rem' }}>
              BayanihanHub is currently in Beta Testing.
            </p>
            <p style={{ margin: '0.35rem 0 0 0', color: '#581c87', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              This deployment is intended for testing the platform before its full release. While using BayanihanHub,
              you may encounter bugs, errors, unexpected behavior, or features that still need improvement.
            </p>
          </div>

          {/* Team Members & Developers Contact Block */}
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              backgroundColor: 'var(--color-neutral-50)',
              border: '1px solid var(--color-neutral-200)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-neutral-900)', fontWeight: 700, fontSize: '0.8125rem' }}>
              <Users style={{ width: '1rem', height: '1rem', color: '#7c3aed' }} />
              <span>Report issues to developers (jeho / christopher) or team members:</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.1rem 0' }}>
              {['Jehosue', 'Christopher', 'Laurice', 'Trisha', 'Leah'].map((name) => (
                <span
                  key={name}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8b4fe',
                    color: '#6b21a8',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {name}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.78125rem' }}>
              <Mail style={{ width: '0.9rem', height: '0.9rem', color: '#6b7280', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-neutral-600)' }}>Designated team email:</span>
              <a
                href="mailto:jbiscarra24113423@student.dmmmsu.edu.ph"
                style={{
                  color: '#7c3aed',
                  fontWeight: 700,
                  textDecoration: 'none',
                  wordBreak: 'break-all',
                }}
              >
                jbiscarra24113423@student.dmmmsu.edu.ph
              </a>
            </div>
          </div>

          {/* Attachment Checklist Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.8125rem' }}>
              When reporting a problem, please feel free to attach:
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #f3f4f6', fontSize: '0.78125rem' }}>
                <span style={{ fontSize: '1rem' }}>📹</span>
                <span>A video recording</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #f3f4f6', fontSize: '0.78125rem' }}>
                <span style={{ fontSize: '1rem' }}>📸</span>
                <span>A screenshot / photo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #f3f4f6', fontSize: '0.78125rem' }}>
                <span style={{ fontSize: '1rem' }}>📝</span>
                <span>Detailed information of what happened</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #f3f4f6', fontSize: '0.78125rem' }}>
                <span style={{ fontSize: '1rem' }}>🔁</span>
                <span>Steps you took before the problem occurred</span>
              </div>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
            Your feedback will help us improve BayanihanHub and prepare it for its full release.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 0.875rem',
              backgroundColor: '#f5f3ff',
              borderRadius: '0.5rem',
              color: '#6d28d9',
              fontWeight: 700,
              fontSize: '0.8125rem',
            }}
          >
            <span>Thank you for helping us test BayanihanHub! 💜</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#fafafa',
            borderTop: '1px solid var(--color-neutral-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          <Button
            variant="primary"
            size="md"
            onClick={handleClose}
            style={{
              minWidth: '7rem',
              backgroundColor: '#7c3aed',
              borderColor: '#7c3aed',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
            }}
          >
            Okay
          </Button>
        </div>
      </div>
    </div>
  );
}
