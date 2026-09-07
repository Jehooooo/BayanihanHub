import { useEffect, useState } from 'react';
import {
  Terminal,
  Activity,
  Database,
  Server,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import BackendTerminal from '@/components/terminal/BackendTerminal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useTerminalStore } from '@/stores/terminalStore';

export default function TerminalPage() {
  const { logs, isConnected, emitTestLog, fetchInitialLogs } = useTerminalStore();
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  const checkDbHealth = async () => {
    setDbStatus('checking');
    try {
      const res = await fetch('http://localhost:3001/api/db-health');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data.status === 'connected' ? 'connected' : 'error');
      } else {
        setDbStatus('error');
      }
    } catch {
      setDbStatus('error');
    }
    setLastCheckTime(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    checkDbHealth();
    fetchInitialLogs();
  }, [fetchInitialLogs]);

  // Count errors and warnings in current logs
  const errorCount = logs.filter((l) => l.level === 'ERROR').length;
  const successCount = logs.filter((l) => l.level === 'SUCCESS').length;
  const dbEventCount = logs.filter((l) => l.level === 'DATABASE' || l.category === 'DATABASE').length;

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#0f172a',
                  color: 'var(--color-primary-400)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #1e293b',
                }}
              >
                <Terminal style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0, letterSpacing: '-0.02em' }}>
                  Backend Terminal & Integration Logs
                </h1>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0.2rem 0 0' }}>
                  Real-time developer console displaying MySQL queries, API traffic, and system events.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={checkDbHealth}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-neutral-700)',
                backgroundColor: '#fff',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              <RotateCw style={{ width: '0.875rem', height: '0.875rem' }} />
              Ping MySQL Health
            </button>
          </div>
        </div>

        {/* Live System Diagnostics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {/* Database Card */}
          <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', backgroundColor: '#fff' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: dbStatus === 'connected' ? '#ecfdf5' : '#fef2f2',
                color: dbStatus === 'connected' ? '#059669' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Database style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                MySQL Database
              </p>
              <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: dbStatus === 'connected' ? '#059669' : '#dc2626', margin: 0 }}>
                {dbStatus === 'connected' ? 'CONNECTED (8.4)' : dbStatus === 'checking' ? 'CHECKING...' : 'ERROR'}
              </p>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-500)' }}>
                {dbEventCount} query events
              </span>
            </div>
          </Card>

          {/* Backend Server Card */}
          <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', backgroundColor: '#fff' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isConnected ? '#ecfdf5' : '#fffbeb',
                color: isConnected ? '#059669' : '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Server style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                FastAPI Gateway
              </p>
              <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
                PORT 3001
              </p>
              <span style={{ fontSize: '0.6875rem', color: isConnected ? '#059669' : '#d97706', fontWeight: 600 }}>
                {isConnected ? 'WebSocket Sync Active' : 'Connecting...'}
              </span>
            </div>
          </Card>

          {/* Successful Operations Card */}
          <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', backgroundColor: '#fff' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                Successful Ops
              </p>
              <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
                {successCount}
              </p>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-500)' }}>
                Recorded in buffer
              </span>
            </div>
          </Card>

          {/* Errors / Warnings Card */}
          <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', backgroundColor: '#fff' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: errorCount > 0 ? '#fef2f2' : '#f8fafc',
                color: errorCount > 0 ? '#dc2626' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertCircle style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                Errors Logged
              </p>
              <p style={{ fontSize: '1.125rem', fontWeight: 800, color: errorCount > 0 ? '#dc2626' : 'var(--color-neutral-900)', margin: 0 }}>
                {errorCount}
              </p>
              <span style={{ fontSize: '0.6875rem', color: errorCount === 0 ? '#059669' : '#dc2626' }}>
                {errorCount === 0 ? 'Healthy (No critical issues)' : 'Requires investigation'}
              </span>
            </div>
          </Card>
        </div>

        {/* Main Terminal Interface */}
        <BackendTerminal height="580px" showHeader={true} />
      </div>
    </AdminLayout>
  );
}
