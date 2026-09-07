import re
import uuid
import time
import asyncio
from datetime import datetime
from collections import deque
from typing import Optional, Dict, Any, List, Set
from fastapi import WebSocket

# Maximum number of logs retained in memory for instant delivery to newly connected clients
MAX_LOGS_BUFFER = 400

# Regex patterns for sanitizing sensitive information
SENSITIVE_PATTERNS = [
    # Passwords in JSON / query params
    (re.compile(r'("(?:password|new_password|current_password|pwd)"\s*:\s*)"[^"]*"', re.IGNORECASE), r'\1"***"'),
    (re.compile(r'(password\s*=\s*)[^\s&]+', re.IGNORECASE), r'\1***'),
    # Authorization tokens (Bearer, JWT)
    (re.compile(r'(Bearer\s+)[A-Za-z0-9\-\._~\+\/]+=*', re.IGNORECASE), r'\1[REDACTED_TOKEN]'),
    (re.compile(r'("(?:access_token|refresh_token|token|secret)"\s*:\s*)"[^"]*"', re.IGNORECASE), r'\1"***"'),
    # Database connection strings with credentials
    (re.compile(r'(mysql\+[a-z]+:\/\/[^:]+:)([^@]+)(@)', re.IGNORECASE), r'\1***\3'),
    # Generic API keys
    (re.compile(r'("(?:api_key|secret_key|private_key)"\s*:\s*)"[^"]*"', re.IGNORECASE), r'\1"***"'),
]


def sanitize_text(text: str) -> str:
    """Removes passwords, auth tokens, and connection credentials from log text."""
    if not isinstance(text, str):
        text = str(text)
    for pattern, replacement in SENSITIVE_PATTERNS:
        text = pattern.sub(replacement, text)
    return text


class TerminalLogger:
    def __init__(self):
        self._buffer: deque = deque(maxlen=MAX_LOGS_BUFFER)
        self._active_connections: Set[WebSocket] = set()
        self._sse_queues: List[asyncio.Queue] = []
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    def _ensure_loop(self):
        try:
            self._loop = asyncio.get_running_loop()
        except RuntimeError:
            self._loop = None

    def _create_entry(
        self,
        level: str,
        message: str,
        category: str = "SYSTEM",
        details: Optional[Any] = None,
    ) -> Dict[str, Any]:
        now = datetime.now()
        clean_msg = sanitize_text(message)
        clean_details = sanitize_text(str(details)) if details is not None else None

        entry = {
            "id": str(uuid.uuid4()),
            "timestamp": now.strftime("%H:%M:%S"),
            "iso_timestamp": now.isoformat(),
            "level": level.upper(),  # INFO, SUCCESS, WARNING, ERROR, DEBUG, API, DB
            "category": category.upper(),
            "message": clean_msg,
            "details": clean_details,
        }
        return entry

    def log(
        self,
        level: str,
        message: str,
        category: str = "SYSTEM",
        details: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """Record a log message, store in buffer, print to server console, and broadcast."""
        entry = self._create_entry(level, message, category, details)
        self._buffer.append(entry)

        # Print to server stdout for standard developer observability (safe for Windows cp1252)
        level_tag = f"[{entry['level']}]"
        cat_tag = f"[{entry['category']}]" if category else ""
        try:
            print(f"[{entry['timestamp']}] {level_tag:9} {cat_tag:8} {entry['message']}")
        except UnicodeEncodeError:
            safe_msg = entry['message'].encode('ascii', errors='replace').decode('ascii')
            print(f"[{entry['timestamp']}] {level_tag:9} {cat_tag:8} {safe_msg}")

        # Dispatch async broadcast to all connected WebSocket and SSE listeners
        self._broadcast(entry)
        return entry

    def info(self, message: str, category: str = "SYSTEM", details: Optional[Any] = None):
        return self.log("INFO", message, category, details)

    def success(self, message: str, category: str = "SYSTEM", details: Optional[Any] = None):
        return self.log("SUCCESS", message, category, details)

    def warning(self, message: str, category: str = "SYSTEM", details: Optional[Any] = None):
        return self.log("WARNING", message, category, details)

    def error(self, message: str, category: str = "SYSTEM", details: Optional[Any] = None):
        return self.log("ERROR", message, category, details)

    def debug(self, message: str, category: str = "SYSTEM", details: Optional[Any] = None):
        return self.log("DEBUG", message, category, details)

    def api(self, method: str, path: str, status_code: int, duration_ms: float, details: Optional[str] = None):
        """Format and log an API request event."""
        if 200 <= status_code < 400:
            level = "SUCCESS"
            msg = f"{method} {path} - {status_code} ({duration_ms}ms)"
        elif 400 <= status_code < 500:
            level = "WARNING"
            msg = f"{method} {path} - {status_code} Client Notice ({duration_ms}ms)"
        else:
            level = "ERROR"
            msg = f"{method} {path} - {status_code} Server Error ({duration_ms}ms)"
        return self.log(level, msg, category="API", details=details)

    def db(self, action: str, details: str, status: str = "SUCCESS", duration_ms: Optional[float] = None):
        """Format and log a database query / event."""
        dur_str = f" [{duration_ms}ms]" if duration_ms is not None else ""
        level = "SUCCESS" if status.upper() == "SUCCESS" else "ERROR"
        msg = f"MySQL {action.upper()}: {details}{dur_str}"
        return self.log(level, msg, category="DATABASE")

    def crud(self, operation: str, entity: str, status: str = "SUCCESS", count: Optional[int] = None, details: Optional[str] = None):
        """Log a CRUD action on a model/table."""
        level = "SUCCESS" if status.upper() == "SUCCESS" else "ERROR"
        count_str = f" ({count} record{'s' if count != 1 else ''})" if count is not None else ""
        detail_str = f" - {details}" if details else ""
        msg = f"{operation.upper()} {entity}{count_str}{detail_str}"
        return self.log(level, msg, category="CRUD")

    def integration(self, source: str, target: str, action: str, status: str = "SUCCESS", details: Optional[str] = None):
        """Log an inter-service communication or external API integration event."""
        level = "SUCCESS" if status.upper() == "SUCCESS" else "ERROR"
        detail_str = f" ({details})" if details else ""
        msg = f"{source} -> {target}: {action}{detail_str}"
        return self.log(level, msg, category="INTEGRATION")

    def get_logs(self, limit: int = 150, level: Optional[str] = None, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve recent logs filtered by level or category."""
        logs = list(self._buffer)
        if level:
            logs = [l for l in logs if l["level"].upper() == level.upper()]
        if category:
            logs = [l for l in logs if l["category"].upper() == category.upper()]
        return logs[-limit:]

    def clear(self):
        """Clear the in-memory log buffer."""
        self._buffer.clear()
        self.info("Backend terminal log buffer cleared by administrator", category="SYSTEM")

    # --- Real-Time Connection Management ---

    async def register_ws(self, websocket: WebSocket):
        """Register a new WebSocket client and immediately push buffered logs."""
        await websocket.accept()
        self._active_connections.add(websocket)
        # Send initial batch of existing logs
        initial_logs = list(self._buffer)
        try:
            await websocket.send_json({
                "type": "INITIAL_LOGS",
                "logs": initial_logs,
                "server_time": datetime.now().strftime("%H:%M:%S"),
            })
        except Exception:
            self._active_connections.discard(websocket)

    def unregister_ws(self, websocket: WebSocket):
        self._active_connections.discard(websocket)

    def register_sse(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self._sse_queues.append(q)
        return q

    def unregister_sse(self, q: asyncio.Queue):
        if q in self._sse_queues:
            self._sse_queues.remove(q)

    def _broadcast(self, entry: Dict[str, Any]):
        """Safely broadcast entry across WebSockets and SSE queues."""
        self._ensure_loop()
        if self._loop and self._loop.is_running():
            asyncio.run_coroutine_threadsafe(self._async_broadcast(entry), self._loop)

    async def _async_broadcast(self, entry: Dict[str, Any]):
        # Broadcast to active WebSockets
        dead_ws = set()
        message = {"type": "NEW_LOG", "log": entry}
        for ws in list(self._active_connections):
            try:
                await ws.send_json(message)
            except Exception:
                dead_ws.add(ws)
        self._active_connections.difference_update(dead_ws)

        # Broadcast to SSE queues
        dead_sse = []
        for q in self._sse_queues:
            try:
                q.put_nowait(entry)
            except Exception:
                dead_sse.append(q)
        for q in dead_sse:
            self.unregister_sse(q)


# Singleton instance
terminal_logger = TerminalLogger()
