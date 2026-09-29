import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Ring } from '@/components/ui/ring';
import SEO from '@/components/common/SEO';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [isValidating, setIsValidating] = useState<boolean>(Boolean(token));
  const [tokenError, setTokenError] = useState<string | null>(
    token ? null : 'This password reset link is invalid or has expired.'
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate reset token on mount
  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setTokenError('This password reset link is invalid or has expired.');
      return;
    }

    let isMounted = true;
    const checkToken = async () => {
      try {
        const response = await fetch(
          `/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`
        );
        const data = await response.json().catch(() => null);

        if (!isMounted) return;

        if (!response.ok || data?.success === false) {
          const msg =
            (typeof data?.detail === 'string'
              ? data.detail
              : data?.detail?.message) ||
            data?.message ||
            'This password reset link is invalid or has expired.';
          setTokenError(msg);
        } else {
          setTokenError(null);
        }
      } catch {
        if (isMounted) {
          // In case of network glitch during initial load, fallback gracefully
          setTokenError(null);
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    checkToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error('Password must contain at least one letter and at least one number or special character.');
      return;
    }

    if (!token) {
      toast.error('This password reset link is invalid or has expired.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let msg = 'Unable to reset your password. Please try again.';
        if (response.status === 401 || response.status === 404) {
          msg = 'This password reset link is invalid or has expired.';
          setTokenError(msg);
        } else if (data?.detail) {
          msg = typeof data.detail === 'string' ? data.detail : data.detail.message || msg;
        } else if (data?.message) {
          msg = data.message;
        } else if (response.status === 429) {
          msg = 'Too many attempts. Please wait a moment and try again.';
        }
        toast.error(msg);
        return;
      }

      const successMsg = data?.message || 'Your password has been reset successfully. You can now log in.';
      toast.success(successMsg);
      navigate('/login');
    } catch {
      toast.error('Unable to reset your password. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Initial token validation loading state
  if (isValidating) {
    return (
      <AuthLayout title="Verifying Link" subtitle="Please wait while we check your reset token...">
        <SEO title="Reset Password" noindex={true} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1rem', gap: '1rem' }}>
          <Ring className="w-8 h-8 text-primary-600" />
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-600)', margin: 0 }}>
            Verifying your password reset link...
          </p>
        </div>
      </AuthLayout>
    );
  }

  // 2. Invalid or expired token error state
  if (tokenError) {
    return (
      <AuthLayout title="Reset Link Expired" subtitle={tokenError}>
        <SEO title="Reset Password" noindex={true} />
        <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', margin: '0 auto' }}>
            <AlertCircle className="w-7 h-7" />
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', margin: 0 }}>
            Password reset links are single-use and expire after 1 hour for your security.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/forgot-password')} className="font-bold shadow-button">
              Request a new password reset link
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // 3. Valid token - show new password form
  return (
    <AuthLayout
      title="Create new password"
      subtitle="Your new password must be different from previously used passwords."
    >
      <SEO title="Reset Password" noindex={true} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<KeyRound className="w-4 h-4" />}
          disabled={isLoading}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<KeyRound className="w-4 h-4" />}
          disabled={isLoading}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          loadingText="Resetting Password..."
          disabled={isLoading}
          className="font-bold shadow-button"
          style={{ marginTop: '0.5rem' }}
        >
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  );
}
