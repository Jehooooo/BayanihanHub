import { useEffect, useRef, useState } from 'react';
import {
  Terminal,
  Play,
  Pause,
  Trash2,
  Download,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Layers,
  Database,
  ArrowDown,
  Sparkles,
  Server,
  Activity,
} from 'lucide-react';
import { useTerminalStore } from '@/stores/terminalStore';
import type { LogEntry, LogLevel } from '@/types/terminal';

interface BackendTerminalProps {
  height?: string;
  showHeader?: boolean;
  compact?: boolean;
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  INFO: { bg: 'rgba(56, 189, 248, 0.12)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' },
  SUCCESS: { bg: 'rgba(74, 222, 128, 0.12)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
  WARNING: { bg: 'rgba(251, 191, 36, 0.12)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  ERROR: { bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171', border: 'rgba(248, 113, 113, 0.35)' },
  DEBUG: { bg: 'rgba(192, 132, 252, 0.12)', text: '#c084fc', border: 'rgba(192, 132, 252, 0.3)' },
  API: { bg: 'rgba(96, 165, 250, 0.12)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
  DATABASE: { bg: 'rgba(45, 212, 191, 0.12)', text: '#2dd4bf', border: 'rgba(45, 212, 191, 0.3)' },
  CRUD: { bg: 'rgba(129, 140, 248, 0.12)', text: '#818cf8', border: 'rgba(129, 140, 248, 0.3)' },
  INTEGRATION: { bg: 'rgba(244, 114, 182, 0.12)', text: '#f472b6', border: 'rgba(244, 114, 182, 0.3)' },
};

const FILTER_LEVELS: LogLevel[] = [
  'ALL',
  'INFO',
  'SUCCESS',
  'WARNING',
  'ERROR',
  'API',
  'DATABASE',
  'CRUD',
  'INTEGRATION',
];

export default function BackendTerminal({
  height = '520px',
  showHeader = true,
  compact = false,
}: BackendTerminalProps) {
  const {
    logs,
    isConnected,
    isConnecting,
    isPaused,
    filterLevel,
    searchTerm,
    autoScroll,
    connect,
    disconnect,
    reconnect,
    togglePause,
    setAutoScroll,
    setFilterLevel,
    setSearchTerm,
    clearLogs,
    emitTestLog,
  } = useTerminalStore();

  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showTestMenu, setShowTestMenu] = useState(false);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => {
      // Don't necessarily disconnect on unmount if user switches tabs quickly, or disconnect cleanly
    };
  }, [connect]);

  // Auto-scroll to newest message
  useEffect(() => {
    if (autoScroll && !isPaused && terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isPaused]);

  // Filter logs by level and search term
  const filteredLogs = logs.filter((log) => {
    const matchesLevel =
      filterLevel === 'ALL' ||
      log.level === filterLevel ||
      (filterLevel === 'DATABASE' && (log.level === 'DATABASE' || log.category === 'DATABASE')) ||
      (filterLevel === 'API' && (log.level === 'API' || log.category === 'API')) ||
      (filterLevel === 'CRUD' && (log.level === 'CRUD' || log.category === 'CRUD')) ||
      (filterLevel === 'INTEGRATION' && (log.level === 'INTEGRATION' || log.category === 'INTEGRATION'));

    const matchesSearch =
      !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesLevel && matchesSearch;
  });

  // Export logs to .txt file
  const handleExportLogs = () => {
    const lines = filteredLogs.map(
      (l) => `[${l.timestamp}] [${l.level.padEnd(7)}] [${l.category.padEnd(10)}] ${l.message}${l.details ? `\n    Details: ${l.details}` : ''}`
    );
    const content = `Bayanihan Hub — Backend Terminal Activity Export\nExported: ${new Date().toLocaleString()}\nTotal entries: ${lines.length}\n${'='.repeat(70)}\n\n${lines.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bayanihan-backend-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getLevelStyle = (level: string) => {
    return LEVEL_COLORS[level] || LEVEL_COLORS.INFO;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#090d16',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #1e293b',
        boxShadow: '0 20px 35px -10px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        color: '#e2e8f0',
        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace",
      }}
    >
      {/* Terminal Window Chrome / Header */}
      {showHeader && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: '#0d131f',
            borderBottom: '1px solid #1e293b',
            userSelect: 'none',
          }}
        >
          {/* Mac-style Window Controls & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: '#f59e0b', display: 'inline-block' }} />
              <span style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: '#10b981', display: 'inline-block' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.25rem' }}>
              <Terminal style={{ width: '1rem', height: '1rem', color: 'var(--color-primary-400)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
                BACKEND TERMINAL
              </span>
              <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>
                • SYSTEM & DATABASE OBSERVABILITY
              </span>
            </div>
          </div>

          {/* Connection Status & Live Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isConnected ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#34d399',
                }}
              >
                <span
                  style={{
                    width: '0.45rem',
                    height: '0.45rem',
                    borderRadius: '9999px',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                  }}
                />
                CONNECTED (PORT 3001)
              </div>
            ) : isConnecting ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                }}
              >
                <RotateCw style={{ width: '0.75rem', height: '0.75rem', animation: 'spin 1s linear infinite' }} />
                CONNECTING...
              </div>
            ) : (
              <button
                type="button"
                onClick={() => reconnect()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#f87171',
                  cursor: 'pointer',
                }}
              >
                <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '9999px', backgroundColor: '#ef4444' }} />
                DISCONNECTED (RECONNECT)
              </button>
            )}

            <div
              style={{
                fontSize: '0.6875rem',
                color: '#94a3b8',
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #334155',
              }}
            >
              {filteredLogs.length} event{filteredLogs.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Terminal Toolbar: Filters & Action Buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.625rem',
          padding: '0.625rem 0.875rem',
          backgroundColor: '#0c111c',
          borderBottom: '1px solid #1e293b',
        }}
      >
        {/* Left: Search input & quick level chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: compact ? '160px' : '220px' }}>
            <Search style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', width: '0.8rem', height: '0.8rem', color: '#64748b' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs (e.g. items, user, mysql)..."
              style={{
                width: '100%',
                padding: '0.35rem 0.5rem 0.35rem 1.75rem',
                fontSize: '0.75rem',
                backgroundColor: '#131b2e',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Level Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {FILTER_LEVELS.map((lvl) => {
              const isSelected = filterLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilterLevel(lvl)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.6875rem',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: '4px',
                    backgroundColor: isSelected ? '#1e293b' : 'transparent',
                    color: isSelected ? '#38bdf8' : '#94a3b8',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={togglePause}
            title={isPaused ? 'Resume live streaming' : 'Pause live streaming'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.625rem',
              fontSize: '0.6875rem',
              fontWeight: 600,
              backgroundColor: isPaused ? 'rgba(245, 158, 11, 0.15)' : '#1e293b',
              color: isPaused ? '#fbbf24' : '#e2e8f0',
              border: `1px solid ${isPaused ? '#fbbf24' : '#334155'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            {isPaused ? <Play style={{ width: '0.75rem', height: '0.75rem' }} /> : <Pause style={{ width: '0.75rem', height: '0.75rem' }} />}
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>

          {/* Auto Scroll Toggle */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Disable auto-scroll lock' : 'Enable auto-scroll lock'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.625rem',
              fontSize: '0.6875rem',
              fontWeight: 600,
              backgroundColor: autoScroll ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
              color: autoScroll ? '#38bdf8' : '#94a3b8',
              border: `1px solid ${autoScroll ? '#38bdf8' : '#334155'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            <ArrowDown style={{ width: '0.75rem', height: '0.75rem' }} />
            {autoScroll ? 'AUTO-SCROLL ON' : 'AUTO-SCROLL OFF'}
          </button>

          {/* Test Log Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowTestMenu(!showTestMenu)}
              title="Emit a simulated backend diagnostic log"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.625rem',
                fontSize: '0.6875rem',
                fontWeight: 600,
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              <Sparkles style={{ width: '0.75rem', height: '0.75rem', color: '#38bdf8' }} />
              EMIT TEST EVENT
            </button>

            {showTestMenu && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  onClick={() => setShowTestMenu(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '0.375rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.375rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    minWidth: '220px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      emitTestLog('INFO', 'Starting background verification worker thread');
                      setShowTestMenu(false);
                    }}
                    style={{ textAlign: 'left', padding: '0.4rem 0.6rem', fontSize: '0.6875rem', background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    [INFO] Background task test
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      emitTestLog('SUCCESS', 'Database transaction committed: 18 rows synchronized');
                      setShowTestMenu(false);
                    }}
                    style={{ textAlign: 'left', padding: '0.4rem 0.6rem', fontSize: '0.6875rem', background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    [SUCCESS] DB Transaction test
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      emitTestLog('WARNING', 'Connection pool near threshold: 8/10 pool slots in use');
                      setShowTestMenu(false);
                    }}
                    style={{ textAlign: 'left', padding: '0.4rem 0.6rem', fontSize: '0.6875rem', background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    [WARNING] Pool notice test
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      emitTestLog('ERROR', 'External notification dispatch failed: Connection timeout');
                      setShowTestMenu(false);
                    }}
                    style={{ textAlign: 'left', padding: '0.4rem 0.6rem', fontSize: '0.6875rem', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    [ERROR] Simulated failure test
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Export Logs */}
          <button
            type="button"
            onClick={handleExportLogs}
            title="Download visible logs as text file"
            style={{
              padding: '0.35rem 0.5rem',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Download style={{ width: '0.85rem', height: '0.85rem' }} />
          </button>

          {/* Clear Logs Button */}
          <button
            type="button"
            onClick={clearLogs}
            title="Clear all log entries"
            style={{
              padding: '0.35rem 0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Trash2 style={{ width: '0.85rem', height: '0.85rem' }} />
          </button>
        </div>
      </div>

      {/* Terminal Screen & Logs Output */}
      <div
        ref={terminalOutputRef}
        style={{
          height,
          overflowY: 'auto',
          padding: '1rem',
          backgroundColor: '#070b13',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          fontSize: compact ? '0.75rem' : '0.8125rem',
          lineHeight: '1.5',
        }}
      >
        {filteredLogs.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <Terminal style={{ width: '2.5rem', height: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }} />
            <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>No backend events recorded yet</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#475569' }}>
              Perform actions across the site or emit a test log to see real-time backend updates.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const style = getLevelStyle(log.level);
            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: selectedLog?.id === log.id ? 'rgba(30, 41, 59, 0.6)' : 'transparent',
                  transition: 'background-color 100ms',
                  cursor: 'pointer',
                  wordBreak: 'break-word',
                }}
                onMouseEnter={(e) => {
                  if (selectedLog?.id !== log.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                }}
                onMouseLeave={(e) => {
                  if (selectedLog?.id !== log.id) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Timestamp */}
                <span style={{ color: '#64748b', flexShrink: 0, userSelect: 'none' }}>
                  [{log.timestamp}]
                </span>

                {/* Level Pill */}
                <span
                  style={{
                    backgroundColor: style.bg,
                    color: style.text,
                    border: `1px solid ${style.border}`,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.08rem 0.4rem',
                    borderRadius: '3px',
                    flexShrink: 0,
                    letterSpacing: '0.04em',
                    lineHeight: 1.2,
                  }}
                >
                  [{log.level}]
                </span>

                {/* Category Pill */}
                {log.category && log.category !== 'SYSTEM' && (
                  <span
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(51, 65, 85, 0.4)',
                      padding: '0.08rem 0.35rem',
                      borderRadius: '3px',
                      flexShrink: 0,
                    }}
                  >
                    [{log.category}]
                  </span>
                )}

                {/* Log Message */}
                <div style={{ flex: 1, minWidth: 0, color: '#f1f5f9' }}>
                  <span>{log.message}</span>
                  {log.details && (
                    <div
                      style={{
                        marginTop: '0.2rem',
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.7)',
                        borderRadius: '3px',
                        borderLeft: `2px solid ${style.text}`,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {log.details}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Footer Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          backgroundColor: '#0d131f',
          borderTop: '1px solid #1e293b',
          fontSize: '0.6875rem',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Server style={{ width: '0.75rem', height: '0.75rem', color: '#10b981' }} />
            FastAPI Backend: localhost:3001
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Database style={{ width: '0.75rem', height: '0.75rem', color: '#38bdf8' }} />
            MySQL 8.4: bayanihan_hub
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isPaused && (
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>
              STREAM PAUSED
            </span>
          )}
          <span>Live WebSocket / SSE Sync</span>
        </div>
      </div>
    </div>
  );
}
