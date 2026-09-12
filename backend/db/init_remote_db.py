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
    with open(file_path, "r", encoding="utf-8-sig") as f:
        content = f.read()

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

    try:
        engine = create_engine(target_url, echo=False)
        with engine.begin() as conn:
            for idx, stmt in enumerate(statements, 1):
                try:
                    conn.execute(text(stmt))
                except Exception as ex:
                    # Ignore harmless drop errors or warnings if table doesn't exist yet
                    if "Unknown table" not in str(ex) and "already exists" not in str(ex):
                        print(f"Warning on statement #{idx}: {str(ex)[:100]}")

        print("\n[SUCCESS] Remote database successfully populated with clean 3NF BayanihanHub schema & data!")
        return True
    except Exception as err:
        print(f"\n[ERROR] Connection or execution failed: {err}")
        return False

if __name__ == "__main__":
    url_arg = sys.argv[1] if len(sys.argv) > 1 else None
    init_remote_db(url_arg)
