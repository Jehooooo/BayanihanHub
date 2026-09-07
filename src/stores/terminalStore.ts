import { create } from 'zustand';
import type { LogEntry, LogLevel, TerminalStats } from '@/types/terminal';

interface TerminalState {
  logs: LogEntry[];
  isConnected: boolean;
  isConnecting: boolean;
  isPaused: boolean;
  filterLevel: LogLevel;
  searchTerm: string;
  autoScroll: boolean;
  stats: TerminalStats | null;
  socket: WebSocket | null;
  sseSource: EventSource | null;

  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  togglePause: () => void;
  setAutoScroll: (auto: boolean) => void;
  setFilterLevel: (level: LogLevel) => void;
  setSearchTerm: (term: string) => void;
  clearLogs: () => Promise<void>;
  emitTestLog: (level: string, message: string) => Promise<void>;
  fetchInitialLogs: () => Promise<void>;
  fetchStats: () => Promise<void>;
  _connectSSE: () => void;
}

const API_BASE = 'http://localhost:3001';
const WS_BASE = 'ws://localhost:3001';

export const useTerminalStore = create<TerminalState>((set, get) => ({
  logs: [],
  isConnected: false,
  isConnecting: false,
  isPaused: false,
  filterLevel: 'ALL',
  searchTerm: '',
  autoScroll: true,
  stats: null,
  socket: null,
  sseSource: null,

  fetchInitialLogs: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/terminal/logs?limit=200`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          set({ logs: data.logs });
        }
      }
    } catch {
      // Backend may be offline or starting
    }
  },

  fetchStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/terminal/stats`);
      if (res.ok) {
        const data = await res.json();
        set({ stats: data });
      }
    } catch {
      // Ignore
    }
  },

  connect: () => {
    const { socket, sseSource, isConnected, isConnecting } = get();
    if (isConnected || isConnecting || socket || sseSource) return;

    set({ isConnecting: true });

    // Initial fetch to immediately populate logs even before socket handshakes
    get().fetchInitialLogs();
    get().fetchStats();

    try {
      const wsUrl = `${WS_BASE}/api/terminal/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        set({
          isConnected: true,
          isConnecting: false,
          socket: ws,
        });
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'INITIAL_LOGS' && Array.isArray(payload.logs)) {
            set((state) => ({
              logs: payload.logs.length > 0 ? payload.logs : state.logs,
            }));
          } else if (payload.type === 'NEW_LOG' && payload.log) {
            set((state) => {
              if (state.isPaused) return state; // Don't append if paused
              const next = [...state.logs, payload.log];
              return { logs: next.slice(-400) };
            });
          }
        } catch {
          // Ignore JSON parse error
        }
      };

      ws.onerror = () => {
        // Fallback to Server-Sent Events (SSE) if WebSocket fails
        ws.close();
      };

      ws.onclose = () => {
        set({ isConnected: false, isConnecting: false, socket: null });
        // Attempt SSE fallback if not connected
        if (!get().sseSource) {
          get()._connectSSE();
        }
      };
    } catch {
      set({ isConnected: false, isConnecting: false });
      get()._connectSSE();
    }
  },

  _connectSSE: () => {
    try {
      const sse = new EventSource(`${API_BASE}/api/terminal/stream`);

      sse.onopen = () => {
        set({ isConnected: true, isConnecting: false, sseSource: sse });
      };

      sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_LOG' && payload.log) {
            set((state) => {
              if (state.isPaused) return state;
              const next = [...state.logs, payload.log];
              return { logs: next.slice(-400) };
            });
          }
        } catch {
          // Ignore parse errors
        }
      };

      sse.onerror = () => {
        sse.close();
        set({ isConnected: false, sseSource: null });
      };
    } catch {
      set({ isConnected: false, sseSource: null });
    }
  },

  disconnect: () => {
    const { socket, sseSource } = get();
    if (socket) {
      socket.close();
    }
    if (sseSource) {
      sseSource.close();
    }
    set({ socket: null, sseSource: null, isConnected: false, isConnecting: false });
  },

  reconnect: () => {
    get().disconnect();
    setTimeout(() => {
      get().connect();
    }, 300);
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  setAutoScroll: (auto: boolean) => {
    set({ autoScroll: auto });
  },

  setFilterLevel: (level: LogLevel) => {
    set({ filterLevel: level });
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },

  clearLogs: async () => {
    try {
      await fetch(`${API_BASE}/api/terminal/logs`, { method: 'DELETE' });
    } catch {
      // Ignore
    }
    set({ logs: [] });
  },

  emitTestLog: async (level: string, message: string) => {
    try {
      await fetch(`${API_BASE}/api/terminal/test?level=${encodeURIComponent(level)}&message=${encodeURIComponent(message)}`, {
        method: 'POST',
      });
    } catch {
      // Fallback local append if backend unreachable
      const fallbackEntry: LogEntry = {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        level: level.toUpperCase(),
        category: 'LOCAL_TEST',
        message: message,
      };
      set((state) => ({ logs: [...state.logs, fallbackEntry] }));
    }
  },
}));
