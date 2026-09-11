import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ScrollToTopButton() {
  const [showButton, setShowButton] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      setShowButton(scrollY > 220);
      setAtBottom(scrollY + windowHeight >= documentHeight - 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!showButton) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      title="Scroll to top"
      style={{
        position: 'fixed',
        bottom: '9.25rem',
        right: '1.5rem',
        zIndex: 998,
        width: '2.75rem',
        height: '2.75rem',
        borderRadius: '9999px',
        backgroundColor: '#ffffff',
        color: 'var(--color-primary-700)',
        border: '1.5px solid var(--color-primary-200)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
        e.currentTarget.style.color = '#ffffff';
        e.currentTarget.style.borderColor = 'var(--color-primary-600)';
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(46, 125, 50, 0.28)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
        e.currentTarget.style.color = 'var(--color-primary-700)';
        e.currentTarget.style.borderColor = 'var(--color-primary-200)';
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.12)';
      }}
    >
      <ArrowUp style={{ width: '1.15rem', height: '1.15rem', strokeWidth: 2.5 }} />
    </button>
  );
}
