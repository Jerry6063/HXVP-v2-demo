#!/usr/bin/env bash
# Render runs this script from the backend/ directory during every deploy.
set -o errexit

pip install -r ../requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate --noinput
