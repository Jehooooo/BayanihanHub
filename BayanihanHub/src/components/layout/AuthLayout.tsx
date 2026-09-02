import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  wide?: boolean;
}

export default function AuthLayout({ children, title, subtitle, wide }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-neutral-50)',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: wide ? '36rem' : '28rem', textAlign: 'center' }}>
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', textDecoration: 'none' }}>
          <img src="/Logo1Revise.png" alt="Bayanihan Hub Logo" style={{ height: '2.5rem', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Bayanihan Hub
          </span>
        </Link>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-neutral-900)', letterSpacing: '-0.025em' }}>{title}</h2>
        {subtitle && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>{subtitle}</p>}
      </div>

      <div style={{ width: '100%', maxWidth: wide ? '36rem' : '28rem', marginTop: '2rem' }}>
        <div
          style={{
            backgroundColor: '#fff',
            padding: '2rem 2.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-neutral-200)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

