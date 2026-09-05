// ============================================================
// Bayanihan Hub — Registration Submitted / Pending Verification Page
// ============================================================

import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, ArrowRight, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PendingVerificationPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '32rem',
          backgroundColor: '#ffffff',
          borderRadius: '1.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          padding: '3rem 2.25rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Animated Badge */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              position: 'absolute',
              width: '6.5rem',
              height: '6.5rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(245, 158, 11, 0.18)',
              animation: 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <div
            style={{
              width: '5rem',
              height: '5rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#b45309',
              boxShadow: '0 10px 20px -3px rgba(245, 158, 11, 0.25)',
            }}
          >
            <Clock style={{ width: '2.5rem', height: '2.5rem', strokeWidth: 2.2 }} />
          </div>
        </div>

        {/* Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.875rem',
            borderRadius: '9999px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span
            style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              backgroundColor: '#f59e0b',
              display: 'inline-block',
            }}
          />
          Status: Pending Verification
        </div>

        {/* Main Headings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            Registration Submitted Successfully
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#475569',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Your Bayanihan Hub registration has been submitted and is now waiting for administrator verification.
          </p>
        </div>

        {/* Notice Card */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '1rem',
            padding: '1.25rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            fontSize: '0.875rem',
            color: '#334155',
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <ShieldAlert style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b', flexShrink: 0, marginTop: '0.125rem' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>
                Account Inactive Pending Review
              </p>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.8125rem' }}>
                Your account will remain inactive until an administrator reviews and approves your registration.
              </p>
            </div>
          </div>

          <div
            style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              fontSize: '0.8125rem',
              color: '#059669',
              fontWeight: 600,
            }}
          >
            ✓ You will be able to log in once your account has been approved.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Link to="/login" style={{ width: '100%', textDecoration: 'none' }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold shadow-button"
            >
              Return to Login
            </Button>
          </Link>

          <Link to="/" style={{ width: '100%', textDecoration: 'none' }}>
            <Button
              variant="outline"
              size="md"
              fullWidth
              leftIcon={<Home className="w-4 h-4" />}
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
