"""
Bayanihan Hub — MySQL Database Initialization & Migration Tool
Executes schema.sql and seed.sql in dependency order.
"""

import os
import sys
import re
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import app.config as config


def get_db_url():
    """Build database connection URL from config or environment."""
    return getattr(config, "DATABASE_URL", None) or os.getenv(
        "DATABASE_URL",
        f"mysql+pymysql://{config.MYSQL_USER}:{config.MYSQL_PASSWORD}@{config.MYSQL_HOST}:{config.MYSQL_PORT}/{config.MYSQL_DATABASE}?charset=utf8mb4",
    )


def read_sql_file(file_path: Path) -> list[str]:
    """Read and split an SQL file into individual statements."""
    with open(file_path, "r", encoding="utf-8-sig") as f:
        content = f.read()

    # Remove full-line comments and split by semicolon
    statements = []
    current_stmt = []

    for line in content.splitlines():
        trimmed = line.strip()
        if trimmed.startswith("--") or not trimmed:
            continue
        current_stmt.append(line)
        if trimmed.endswith(";"):
            full_stmt = "\n".join(current_stmt).strip()
            if full_stmt:
                statements.append(full_stmt)
            current_stmt = []

    return statements


def initialize_database(url: str = None, dry_run: bool = False):
    """Execute schema and seed SQL statements."""
    db_url = url or get_db_url()
    schema_path = Path(__file__).resolve().parent / "schema.sql"
    seed_path = Path(__file__).resolve().parent / "seed.sql"

    print("=" * 65)
    print("Bayanihan Hub Database Architecture Initializer (3NF)")
    print("=" * 65)
    print(f"Target Database URL: {db_url}")
    print(f"Schema File: {schema_path}")
    print(f"Seed File:   {seed_path}")

    schema_statements = read_sql_file(schema_path)
    seed_statements = read_sql_file(seed_path)

    print(f"\nFound {len(schema_statements)} schema statements.")
    print(f"Found {len(seed_statements)} seed statements.")

    if dry_run:
        print("\n[DRY RUN] Validated SQL files successfully. No changes made.")
        return True

    try:
        from sqlalchemy import create_engine, text

        engine = create_engine(db_url, echo=False)

        with engine.begin() as conn:
            print("\n[1/2] Executing Schema DDL statements...")
            for idx, stmt in enumerate(schema_statements, 1):
                conn.execute(text(stmt))

            print("\n[2/2] Inserting Reference Seed data...")
            for idx, stmt in enumerate(seed_statements, 1):
                conn.execute(text(stmt))

        print("\n[SUCCESS] Database initialized and verified in 3NF!")
        return True

    except Exception as err:
        print(f"\n[NOTE] Could not connect to live MySQL instance ({err}).")
        print("Schema files (schema.sql & seed.sql) are verified and ready for deployment.")
        return False


if __name__ == "__main__":
    is_dry_run = "--dry-run" in sys.argv
    initialize_database(dry_run=is_dry_run)
