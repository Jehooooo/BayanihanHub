import { useState } from 'react';
import { Terminal, X, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import BackendTerminal from './BackendTerminal';
import { useAuthStore } from '@/stores/authStore';
import { useTerminalStore } from '@/stores/terminalStore';

export default function FloatingTerminalDrawer() {
  const { user } = useAuthStore();
  const { isConnected, logs } = useTerminalStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Allow admins and developers to see this toggle
  // If no user or normal user in development, show the sleek dev toggle
  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed z-45 bottom-20 lg:bottom-5 left-3 lg:left-5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Open Backend Terminal & Real-Time Logs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.85rem',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: "'JetBrains Mono', monospace",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1e293b';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0f172a';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Terminal style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-primary-400)' }} />
          <span>Backend Terminal</span>
          <span
            style={{
              width: '0.45rem',
              height: '0.45rem',
              borderRadius: '9999px',
              backgroundColor: isConnected ? '#10b981' : '#ef4444',
              boxShadow: isConnected ? '0 0 6px #10b981' : 'none',
            }}
          />
          {logs.length > 0 && (
            <span
              style={{
                backgroundColor: '#334155',
                color: '#cbd5e1',
                padding: '0.1rem 0.35rem',
                borderRadius: '9999px',
                fontSize: '0.625rem',
              }}
            >
              {logs.length}
            </span>
          )}
        </button>
      </div>

      {/* Slide-Up Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '4rem',
            left: '1.25rem',
            right: '1.25rem',
            maxWidth: isExpanded ? 'calc(100vw - 2.5rem)' : '72rem',
            margin: '0 auto',
            zIndex: 50,
            animation: 'slide-up 0.25s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1e293b',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              border: '1px solid #334155',
              borderBottom: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
                LIVE BACKEND TERMINAL
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem', display: 'flex' }}
                title={isExpanded ? 'Restore size' : 'Expand width'}
              >
                {isExpanded ? <Minimize2 style={{ width: '0.85rem', height: '0.85rem' }} /> : <Maximize2 style={{ width: '0.85rem', height: '0.85rem' }} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem', display: 'flex' }}
                title="Close terminal drawer"
              >
                <X style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
          </div>

          <BackendTerminal
            height={isExpanded ? '600px' : '380px'}
            showHeader={false}
            compact={true}
          />
        </div>
      )}
    </>
  );
}
