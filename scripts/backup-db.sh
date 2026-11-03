#!/usr/bin/env bash
# Supabase veritabanının gecelik yedeği. Sunucuda cron ile çalışır, ayrıntı README'de.
set -euo pipefail

ENV_FILE="${ENV_FILE:-$HOME/.asistanim-yedek.env}"
# shellcheck source=/dev/null
[ -f "$ENV_FILE" ] && . "$ENV_FILE"

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL tanımlı değil ($ENV_FILE dosyasına ekle)}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/asistanim-yedek}"
KEEP_DAYS="${KEEP_DAYS:-30}"

mkdir -p "$BACKUP_DIR"
file="$BACKUP_DIR/asistanim-$(date +%F).sql.gz"

pg_dump "$SUPABASE_DB_URL" --schema=public --no-owner --no-privileges | gzip > "$file"
find "$BACKUP_DIR" -name 'asistanim-*.sql.gz' -mtime +"$KEEP_DAYS" -delete

echo "$(date '+%F %T') yedek alındı: $file ($(du -h "$file" | cut -f1))"
