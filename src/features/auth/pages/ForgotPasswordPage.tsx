import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsSubmitted(true);
      }, 500);
    }
  };

  return (
    <AuthLayout
      title={isSubmitted ? 'Check your email' : 'Reset your password'}
      subtitle={
        isSubmitted
          ? `We've sent recovery instructions to ${email}`
          : 'Enter your account email to receive a password reset link.'
      }
    >
      {isSubmitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', lineHeight: '1.6' }}>
            If an account exists with that email, you will receive password reset instructions within a few minutes.
          </p>

          <Link to="/login" style={{ display: 'block', width: '100%' }}>
            <Button variant="primary" fullWidth className="font-bold">
              Return to Log In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="font-bold shadow-button"
          >
            Send Reset Link
          </Button>

          <div style={{ paddingTop: '0.5rem', textAlign: 'center' }}>
            <Link
              to="/login"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)', textDecoration: 'none' }}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Log In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
