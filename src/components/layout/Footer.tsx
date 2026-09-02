import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  const footerLinks = [
    { to: '/terms', label: 'Terms of Service' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/guidelines', label: 'Community Guidelines' },
    { to: '/safety', label: 'Safety Tips' },
    { to: '/contact', label: 'Contact Us' },
  ];

  return (
    <footer style={{ backgroundColor: '#fff', borderTop: '1px solid var(--color-neutral-200)', marginTop: 'auto' }}>
      <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem' }}>
          {/* Brand */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <img src="/Logo1Revise.png" alt="Bayanihan Hub Logo" style={{ height: '2.5rem', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              Bayanihan Hub
            </span>
          </Link>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', lineHeight: '1.6', maxWidth: '32rem', margin: 0 }}>
            A community platform where you can donate, exchange, or request essential items.
            Stronger together. Share. Care. Inspire.
          </p>

          {/* Specified Legal & Community Links */}
          <nav aria-label="Footer Navigation">
            <ul style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--color-neutral-600)',
                      textDecoration: 'none',
                      transition: 'color 150ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-600)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-neutral-600)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Bar */}
          <div style={{ width: '100%', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-400)', margin: 0 }}>
              &copy; {new Date().getFullYear()} Bayanihan Hub. All rights reserved.
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
              Made with <Heart style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-danger)', fill: 'var(--color-danger)' }} /> for the community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

