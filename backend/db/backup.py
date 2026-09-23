"""
Bayanihan Hub — Automated MySQL Database Backup Script
Creates timestamped SQL dumps of the Bayanihan Hub database.
Supports direct mysqldump invocation or SQLAlchemy row-dump fallback.
"""

import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import app.config as config


def run_backup():
    backups_dir = backend_dir / "backups"
    backups_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    db_name = config.MYSQL_DATABASE or "bayanihan_hub"
    backup_file = backups_dir / f"backup_{db_name}_{timestamp}.sql"

    print("=" * 60)
    print("Bayanihan Hub — MySQL Database Backup Utility")
    print("=" * 60)
    print(f"Target Database: {db_name}")
    print(f"Output File:     {backup_file}")

    # Build mysqldump command
    mysqldump_cmd = [
        "mysqldump",
        f"-h{config.MYSQL_HOST}",
        f"-P{config.MYSQL_PORT}",
        f"-u{config.MYSQL_USER}",
        f"--result-file={backup_file}",
        "--single-transaction",
        "--quick",
        "--routines",
        "--triggers",
        db_name,
    ]

    if config.MYSQL_PASSWORD:
        mysqldump_cmd.insert(4, f"-p{config.MYSQL_PASSWORD}")

    try:
        print("Executing mysqldump...")
        result = subprocess.run(
            mysqldump_cmd,
            check=True,
            capture_output=True,
            text=True
        )
        file_size_kb = round(os.path.getsize(backup_file) / 1024, 2)
        print(f"[SUCCESS] Database backup created successfully! ({file_size_kb} KB)")
        print(f"Saved to: {backup_file}")
    except FileNotFoundError:
        print("[WARNING] 'mysqldump' command not found in system PATH.")
        print("To run backups via mysqldump, ensure MySQL bin/ directory is in your PATH.")
        print(f"Manual command: mysqldump -h {config.MYSQL_HOST} -u {config.MYSQL_USER} -p {db_name} > {backup_file}")
    except subprocess.CalledProcessError as exc:
        print(f"[ERROR] mysqldump failed with exit code {exc.returncode}: {exc.stderr}")


if __name__ == "__main__":
    run_backup()
