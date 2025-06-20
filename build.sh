#!/usr/bin/env bash

# Exit on error
set -o errexit

# Change to the subdirectory
cd b2b_platform

ls -l

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Collect static files (if using static files)
python manage.py collectstatic --noinput
