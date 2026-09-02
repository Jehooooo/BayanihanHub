import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('maria@example.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    const success = await login({ email, password, rememberMe });
    if (success) {
      toast.success('Welcome back to Bayanihan Hub!');
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to access your donations, exchanges, and messages"
    >
      {error && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: 'var(--color-danger)', fontSize: '0.875rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{error}</span>
        </div>
      )}

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

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', accentColor: 'var(--color-primary-600)' }}
            />
            <span style={{ color: 'var(--color-neutral-700)' }}>Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            style={{ fontWeight: 500, color: 'var(--color-primary-600)', textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Log In
        </Button>

        {/* Demo Quick Logins */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-100)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', textAlign: 'center', marginBottom: '0.75rem' }}>Quick demo accounts:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEmail('maria@example.com');
                setPassword('password123');
              }}
            >
              User Demo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEmail('admin@bayanihanhub.com');
                setPassword('admin123');
              }}
            >
              Admin Demo
            </Button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)', paddingTop: '0.5rem' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ fontWeight: 600, color: 'var(--color-primary-600)', textDecoration: 'none' }}
          >
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
