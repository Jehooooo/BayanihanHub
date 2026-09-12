"""
BayanihanHub — Remote Database Migration & Setup Tool
Applies bayanihanhub_production_clean.sql directly to any remote MySQL database (e.g. Aiven, PlanetScale, Railway, Render).
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))
load_dotenv(backend_dir / ".env")

import app.config as config
from sqlalchemy import create_engine, text

def read_sql_file(file_path: Path) -> list[str]:
    raw = file_path.read_bytes()
    if raw.startswith(b'\xff\xfe') or raw.startswith(b'\xfe\xff'):
        content = raw.decode('utf-16', errors='replace')
    else:
        try:
            content = raw.decode('utf-8-sig')
        except UnicodeDecodeError:
            content = raw.decode('utf-8', errors='replace')

    statements = []
    current = []
    in_delimiter = False

    for line in content.splitlines():
        trimmed = line.strip()
        if trimmed.startswith("/*") and trimmed.endswith("*/;"):
            continue
        if trimmed.startswith("--") or not trimmed:
            continue
        current.append(line)
        if trimmed.endswith(";"):
            full_stmt = "\n".join(current).strip()
            if full_stmt:
                statements.append(full_stmt)
            current = []

    return statements

def init_remote_db(db_url: str = None):
    target_url = db_url or os.getenv("DATABASE_URL") or config.DATABASE_URL
    dump_path = Path(__file__).resolve().parent / "bayanihanhub_production_clean.sql"

    print("=" * 65)
    print("BayanihanHub Remote MySQL Database Setup")
    print("=" * 65)
    print(f"Target Database URL: {target_url.split('@')[-1] if '@' in target_url else target_url}")
    print(f"SQL Dump File:       {dump_path}")

    if not dump_path.exists():
        print(f"ERROR: Dump file not found at {dump_path}")
        return False

    print("\nReading SQL statements...")
    statements = read_sql_file(dump_path)
    print(f"Parsed {len(statements)} SQL statements.")

    clean_url = target_url.replace("?ssl_mode=REQUIRED", "").replace("&ssl_mode=REQUIRED", "")
    if "?" not in clean_url:
        clean_url += "?charset=utf8mb4"

    connect_args = {}
    if "aivencloud.com" in clean_url:
        connect_args = {"ssl": {"ssl_mode": "REQUIRED"}}

    try:
        engine = create_engine(clean_url, connect_args=connect_args, echo=False)
        with engine.begin() as conn:
            conn.execute(text("SET FOREIGN_KEY_CHECKS=0;"))
            for idx, stmt in enumerate(statements, 1):
                try:
                    conn.execute(text(stmt))
                except Exception as ex:
                    # Ignore harmless drop errors or warnings if table doesn't exist yet
                    err_str = str(ex)
                    if "Unknown table" not in err_str and "already exists" not in err_str and "doesn't exist" not in err_str:
                        print(f"Warning on statement #{idx}: {err_str[:120]}")
            conn.execute(text("SET FOREIGN_KEY_CHECKS=1;"))

        print("\n[SUCCESS] Remote database successfully populated with clean 3NF BayanihanHub schema & data!")
        return True
    except Exception as err:
        print(f"\n[ERROR] Connection or execution failed: {err}")
        return False

if __name__ == "__main__":
    url_arg = sys.argv[1] if len(sys.argv) > 1 else None
    init_remote_db(url_arg)
