import json
import asyncio
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import StreamingResponse
from app.services.terminal_logger import terminal_logger

router = APIRouter(prefix="/api/terminal", tags=["Terminal Logs"])


@router.get("/logs")
def get_terminal_logs(
    limit: int = Query(default=150, ge=1, le=500),
    level: Optional[str] = None,
    category: Optional[str] = None,
):
    """Retrieve buffered backend logs formatted for the developer terminal."""
    logs = terminal_logger.get_logs(limit=limit, level=level, category=category)
    return {
        "success": True,
        "count": len(logs),
        "server_time": datetime.now().strftime("%H:%M:%S"),
        "logs": logs,
    }


@router.delete("/logs")
def clear_terminal_logs():
    """Clear all buffered logs from the terminal."""
    terminal_logger.clear()
    return {"success": True, "message": "Terminal logs cleared"}


@router.get("/stats")
def get_terminal_stats():
    """Return summary statistics of logged events."""
    all_logs = terminal_logger.get_logs(limit=400)
    level_counts = {}
    for l in all_logs:
        lvl = l["level"]
        level_counts[lvl] = level_counts.get(lvl, 0) + 1

    return {
        "total_buffered": len(all_logs),
        "levels": level_counts,
        "active_ws_clients": len(terminal_logger._active_connections),
        "server_time": datetime.now().strftime("%H:%M:%S"),
    }


@router.post("/test")
def trigger_test_log(level: str = "INFO", message: str = "Test developer terminal event"):
    """Trigger a custom log event for verification and diagnostics."""
    valid_levels = ["INFO", "SUCCESS", "WARNING", "ERROR", "DEBUG"]
    lvl = level.upper() if level.upper() in valid_levels else "INFO"
    entry = terminal_logger.log(lvl, message, category="DIAGNOSTICS")
    return {"success": True, "entry": entry}


@router.get("/stream")
async def stream_terminal_logs():
    """Server-Sent Events (SSE) endpoint for streaming terminal logs."""
    queue = terminal_logger.register_sse()

    async def event_generator():
        try:
            # Yield initial connect ping
            yield f"data: {json.dumps({'type': 'CONNECTED', 'timestamp': datetime.now().strftime('%H:%M:%S')})}\n\n"
            while True:
                entry = await queue.get()
                yield f"data: {json.dumps({'type': 'NEW_LOG', 'log': entry})}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            terminal_logger.unregister_sse(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.websocket("/ws")
async def websocket_terminal_endpoint(websocket: WebSocket):
    """Full-duplex real-time WebSocket connection for streaming backend logs."""
    await terminal_logger.register_ws(websocket)
    try:
        while True:
            # Listen for client pings or client actions (e.g. clear, filter)
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("action") == "PING":
                    await websocket.send_json({"type": "PONG", "time": datetime.now().strftime("%H:%M:%S")})
                elif msg.get("action") == "CLEAR":
                    terminal_logger.clear()
            except Exception:
                pass
    except WebSocketDisconnect:
        terminal_logger.unregister_ws(websocket)
    except Exception:
        terminal_logger.unregister_ws(websocket)
