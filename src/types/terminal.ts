export type LogLevel =
  | 'ALL'
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'DEBUG'
  | 'API'
  | 'DATABASE'
  | 'CRUD'
  | 'INTEGRATION';

export interface LogEntry {
  id: string;
  timestamp: string;
  iso_timestamp?: string;
  level: string;
  category: string;
  message: string;
  details?: string | null;
}

export interface TerminalStats {
  total_buffered: number;
  levels: Record<string, number>;
  active_ws_clients: number;
  server_time: string;
}
