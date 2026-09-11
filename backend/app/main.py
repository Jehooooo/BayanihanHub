import time
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.routers import verification, auth, admin, notifications, items, exchanges, requests, messaging, profile, ai, terminal, reports
from app.db import get_db, engine
from app.services.terminal_logger import terminal_logger
import app.config as config

app = FastAPI(
    title="Bayanihan Hub Community Platform API",
    description="Python FastAPI backend powering identity verification, items, barter exchanges, community requests, direct messaging, and AI assistant for Bayanihan Hub.",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    """Logs all incoming API requests and their response times to the terminal logger."""
    path = request.url.path
    method = request.method

    # Skip logging the terminal's own streaming/polling traffic to prevent infinite loops
    is_terminal_stream = path.startswith("/api/terminal/stream") or path.startswith("/api/terminal/logs")
    if is_terminal_stream or path == "/health" or path == "/favicon.ico":
        return await call_next(request)

    start_time = time.perf_counter()
    terminal_logger.info(f"Frontend -> Backend: {method} {path}", category="API")

    try:
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 1)
        terminal_logger.api(method, path, response.status_code, duration_ms)
        return response
    except Exception as exc:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 1)
        terminal_logger.error(f"{method} {path} - Exception: {type(exc).__name__} ({duration_ms}ms)", category="API")
        raise exc


@app.on_event("startup")
async def on_startup_logging():
    """Initializes startup diagnostic logs for terminal visibility."""
    terminal_logger.info("Backend server starting...", category="SYSTEM")
    terminal_logger.info("Connecting to MySQL database...", category="DATABASE")
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        terminal_logger.success("Database connected successfully (MySQL 8.4 on localhost:3306)", category="DATABASE")
    except Exception as exc:
        terminal_logger.error("Database connection failed", category="DATABASE", details=str(exc))
        terminal_logger.error("Unable to connect to MySQL database", category="DATABASE")

    terminal_logger.info("API routes initialized (12 routers loaded)", category="SYSTEM")
    terminal_logger.info("Authentication service ready", category="AUTH")
    terminal_logger.info("Real-time WebSocket & SSE log engine active", category="SYSTEM")
    terminal_logger.success(f"Backend server listening on http://{config.HOST}:{config.PORT}", category="SYSTEM")


# Include routers
app.include_router(auth.router)
app.include_router(verification.router)
app.include_router(admin.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(items.router)
app.include_router(exchanges.router)
app.include_router(requests.router)
app.include_router(messaging.router)
app.include_router(profile.router)
app.include_router(ai.router)
app.include_router(terminal.router)

import os
from fastapi.staticfiles import StaticFiles

PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public"))
UPLOADS_DIR = os.path.join(PUBLIC_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")



@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "BayanihanHub-Python-Backend",
        "version": "1.0.0",
    }


@app.get("/db-health")
@app.get("/api/db-health")
def db_health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "engine": "MySQL 8.4 (Laragon)",
            "database": "bayanihan_hub",
        }
    except Exception as exc:
        return {
            "status": "disconnected",
            "error": str(exc),
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
    )
