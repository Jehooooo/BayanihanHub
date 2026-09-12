import time
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import app.config as config
from app.services.terminal_logger import terminal_logger

connect_args = {}
if "aivencloud.com" in getattr(config, "DATABASE_URL", "") or "aivencloud.com" in getattr(config, "MYSQL_HOST", ""):
    connect_args = {"ssl": {"ssl_mode": "REQUIRED"}}

# Create SQLAlchemy engine with connection pool recycling
engine = create_engine(
    config.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _summarize_sql(statement: str) -> str:
    """Produces a clean, safe summary of an SQL statement for developer logs."""
    cleaned = " ".join(statement.strip().split())
    # Keep only the first ~80 characters to avoid huge multi-line queries
    if len(cleaned) > 85:
        return cleaned[:82] + "..."
    return cleaned


@event.listens_for(engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault("query_start_time", []).append(time.perf_counter())


@event.listens_for(engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    try:
        start_times = conn.info.get("query_start_time", [])
        if start_times:
            total = time.perf_counter() - start_times.pop()
            duration_ms = round(total * 1000, 2)
        else:
            duration_ms = 0.0

        stmt_strip = statement.strip()
        # Ignore noisy keepalive health checks
        if stmt_strip == "SELECT 1" or stmt_strip == "SELECT 1;":
            return

        first_word = stmt_strip.split()[0].upper() if stmt_strip else "QUERY"
        summary = _summarize_sql(stmt_strip)

        row_count = cursor.rowcount if hasattr(cursor, "rowcount") and cursor.rowcount >= 0 else None
        count_desc = f" ({row_count} row{'s' if row_count != 1 else ''})" if row_count is not None else ""

        terminal_logger.db(
            action=first_word,
            details=f"{summary}{count_desc}",
            status="SUCCESS",
            duration_ms=duration_ms,
        )
    except Exception:
        pass


@event.listens_for(engine, "handle_error")
def handle_cursor_error(context):
    try:
        err_msg = str(context.original_exception) if context.original_exception else "Database operation failed"
        terminal_logger.error(
            f"Database query error: {err_msg[:120]}",
            category="DATABASE",
        )
    except Exception:
        pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for obtaining a database session."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

