#!/usr/bin/env bash
# Render runs this script from the backend/ directory during every deploy.
set -o errexit

pip install -r ../requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate --noinput

# Provision the production admin account from env vars (idempotent).
# Skipped gracefully if ADMIN_EMAIL / ADMIN_PASSWORD are not set (e.g. local dev).
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  python manage.py ensure_admin
fi
