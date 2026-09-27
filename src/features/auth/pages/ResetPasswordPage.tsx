import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, ArrowRight } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SEO from '@/components/common/SEO';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error('Invalid or missing reset token.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let msg = 'Your reset token may have expired or is invalid. Please request a new link.';
        if (data?.detail) {
          msg = typeof data.detail === 'string' ? data.detail : data.detail.message || msg;
        } else if (data?.message) {
          msg = data.message;
        } else if (response.status === 429) {
          msg = 'Too many attempts. Please wait a moment and try again.';
        } else if (response.status >= 500) {
          msg = "We couldn't reset your password right now. Please try again in a moment.";
        }
        toast.error(msg);
        return;
      }

      const successMsg = data?.message || 'Password has been reset successfully! Please log in.';
      toast.success(successMsg);
      navigate('/login');
    } catch (error) {
      toast.error("We couldn't connect to the server. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid Request" subtitle="No reset token was provided.">
        <SEO title="Reset Password" noindex={true} />
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Button variant="outline" onClick={() => navigate('/forgot-password')}>
            Request a new link
          </Button>
        </div>
      </AuthLayout>
    );
  }

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
          required
        />
        
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<KeyRound className="w-4 h-4" />}
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
