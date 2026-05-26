#!/usr/bin/env bash
set -o errexit

MEDIA_ROOT_DIR="${MEDIA_ROOT:-./media}"

mkdir -p "$MEDIA_ROOT_DIR"

exec gunicorn config.wsgi:application --bind 0.0.0.0:"$PORT" --workers 2 --timeout 120
