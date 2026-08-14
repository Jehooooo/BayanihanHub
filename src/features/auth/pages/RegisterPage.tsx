import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    barangay: 'Poblacion',
    municipality: 'San Fernando',
    province: 'La Union',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!formData.acceptTerms) {
      toast.error('Please accept the Terms of Service to register.');
      return;
    }

    const success = await register(formData);
    if (success) {
      toast.success('Registration successful! Welcome to Bayanihan Hub.');
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join your local community and start sharing essential items"
      wide
    >
      {error && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: 'var(--color-danger)', fontSize: '0.875rem', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="Juan Dela Cruz"
            leftIcon={<User className="w-4 h-4" />}
            required
          />
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="juandc"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="juan@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+63 912 345 6789"
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
        </div>

        <Input
          label="Street Address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="123 Rizal St."
          leftIcon={<MapPin className="w-4 h-4" />}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <Input
            label="Barangay"
            value={formData.barangay}
            onChange={(e) => handleChange('barangay', e.target.value)}
            required
          />
          <Input
            label="Municipality"
            value={formData.municipality}
            onChange={(e) => handleChange('municipality', e.target.value)}
            required
          />
          <Input
            label="Province"
            value={formData.province}
            onChange={(e) => handleChange('province', e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
        </div>

        <div style={{ paddingTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', cursor: 'pointer', userSelect: 'none', fontSize: '0.75rem', color: 'var(--color-neutral-600)' }}>
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => handleChange('acceptTerms', e.target.checked)}
              style={{ marginTop: '0.125rem', width: '1rem', height: '1rem', borderRadius: '0.25rem', accentColor: 'var(--color-primary-600)' }}
              required
            />
            <span>
              I accept the{' '}
              <Link to="/terms" className="text-primary-600 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 underline">
                Privacy Policy
              </Link>.
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)', paddingTop: '0.5rem' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ fontWeight: 600, color: 'var(--color-primary-600)', textDecoration: 'none' }}
          >
            Log In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
