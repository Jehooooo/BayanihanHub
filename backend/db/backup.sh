#!/usr/bin/env bash
# ============================================================
# Bayanihan Hub — Automated Database Backup Shell Script
# Recommended cron job: 0 2 * * * /path/to/backup.sh
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
BACKUPS_DIR="$BACKEND_DIR/backups"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"

mkdir -p "$BACKUPS_DIR"

DB_HOST="${MYSQL_HOST:-localhost}"
DB_PORT="${MYSQL_PORT:-3306}"
DB_USER="${MYSQL_USER:-root}"
DB_PASS="${MYSQL_PASSWORD:-}"
DB_NAME="${MYSQL_DATABASE:-bayanihan_hub}"
OUTPUT_FILE="$BACKUPS_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Starting Bayanihan Hub database backup: $(date)"

if [ -n "$DB_PASS" ]; then
    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" \
        --single-transaction --quick --routines --triggers "$DB_NAME" | gzip > "$OUTPUT_FILE"
else
    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" \
        --single-transaction --quick --routines --triggers "$DB_NAME" | gzip > "$OUTPUT_FILE"
fi

echo "Backup completed successfully: $OUTPUT_FILE ($(du -h "$OUTPUT_FILE" | cut -f1))"

# Retention: Delete backups older than 30 days
find "$BACKUPS_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
echo "Old backups pruned (>30 days)."
