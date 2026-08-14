import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#fff', borderTop: '1px solid var(--color-neutral-200)', marginTop: 'auto' }}>
      <div className="page-container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
              <img src="/Logo1Revise.png" alt="Bayanihan Hub Logo" style={{ height: '2.25rem', width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                Bayanihan Hub
              </span>
            </Link>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', lineHeight: '1.6', maxWidth: '18rem', margin: 0 }}>
              A community platform where you can donate, exchange, or request essential items.
              Stronger together. Share. Care. Inspire.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)', margin: 0 }}>
              Quick Links
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                { to: '/browse', label: 'Browse Items' },
                { to: '/requests', label: 'Requests' },
                { to: '/post', label: 'Post an Item' },
                { to: '/exchanges', label: 'Exchanges' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', textDecoration: 'none', transition: 'color 150ms' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)', margin: 0 }}>
              Company
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                { to: '/about', label: 'About Us' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', textDecoration: 'none', transition: 'color 150ms' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)', margin: 0 }}>
              Community
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                { to: '/help', label: 'Help Center' },
                { to: '/guidelines', label: 'Community Guidelines' },
                { to: '/safety', label: 'Safety Tips' },
                { to: '/feedback', label: 'Feedback' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', textDecoration: 'none', transition: 'color 150ms' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-400)', margin: 0 }}>
            REPLACE THIS IF NEEDED
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
            Made with <Heart style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-danger)', fill: 'var(--color-danger)' }} /> for the community
          </p>
        </div>
      </div>
    </footer>
  );
}

