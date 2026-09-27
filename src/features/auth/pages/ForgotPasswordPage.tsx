import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import SEO from '@/components/common/SEO';

type FlowStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FlowStatus>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Prevent duplicate rapid submissions
    if (status === 'LOADING') return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setStatus('LOADING');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus('ERROR');
        let msg = "We couldn't send the reset link right now. Please try again later.";
        if (data?.detail) {
          msg = typeof data.detail === 'string' ? data.detail : data.detail.message || msg;
        } else if (data?.message) {
          msg = data.message;
        } else if (response.status === 429) {
          msg = 'Too many reset requests. Please wait a few minutes before trying again.';
        }
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      // Success
      setStatus('SUCCESS');
      const successMsg = data?.message || 'Reset link sent! Please check your inbox.';
      toast.success(successMsg);
    } catch (error: any) {
      setStatus('ERROR');
      const msg = "We couldn't connect to the server. Please check your internet connection and try again.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleResetForm = () => {
    setStatus('IDLE');
    setErrorMessage(null);
  };

  return (
    <AuthLayout
      title={status === 'SUCCESS' ? 'Reset link sent' : 'Reset your password'}
      subtitle={
        status === 'SUCCESS'
          ? `If an account exists for this email address, check your inbox for instructions to reset your password.`
          : 'Enter your account email to receive a password reset link.'
      }
    >
      <SEO title="Forgot Password" noindex={true} />

      {status === 'SUCCESS' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '9999px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.5rem 0' }}>
              Instructions sent to <span style={{ color: 'var(--color-primary-700)' }}>{email}</span>
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', lineHeight: '1.6', margin: 0 }}>
              If you don't see the email within a couple minutes, please check your spam or junk folder. The reset link is valid for 1 hour.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/login" style={{ display: 'block', width: '100%' }}>
              <Button variant="primary" fullWidth className="font-bold">
                Return to Log In
              </Button>
            </Link>

            <button
              type="button"
              onClick={handleResetForm}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-neutral-600)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                padding: '0.5rem',
                textDecoration: 'underline',
              }}
            >
              Didn't receive an email? Try another address
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {status === 'ERROR' && errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#991b1b',
                fontSize: '0.8125rem',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'ERROR') setStatus('IDLE');
            }}
            placeholder="name@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
            disabled={status === 'LOADING'}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={status === 'LOADING'}
            loadingText="Sending Reset Link..."
            disabled={status === 'LOADING'}
            className="font-bold shadow-button"
          >
            Send Reset Link
          </Button>

          <div style={{ paddingTop: '0.5rem', textAlign: 'center' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-neutral-600)',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Log In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

