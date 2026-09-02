import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#fff', borderTop: '1px solid var(--color-neutral-200)', marginTop: 'auto' }}>
      <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
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

          {/* Bottom Bar */}
          <div style={{ width: '100%', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
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

