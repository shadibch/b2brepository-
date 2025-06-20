#!/usr/bin/env bash
cd b2b_platform
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate