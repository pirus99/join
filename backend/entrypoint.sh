#!/usr/bin/env bash
set -e

echo "Starting entrypoint script..."

# Wait a bit for any database to be ready (useful for PostgreSQL/MySQL in the future)
sleep 2

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Create superuser if environment variables are provided
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ] && [ -n "$DJANGO_SUPERUSER_EMAIL" ]; then
    echo "Checking if superuser needs to be created..."
    # Use Python to create superuser with proper escaping and error handling
    python manage.py shell <<EOF
from django.contrib.auth import get_user_model
import os
import sys

try:
    User = get_user_model()
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f'Superuser {username} created successfully.')
    else:
        print(f'Superuser {username} already exists.')
except Exception as e:
    print(f'Error creating superuser: {e}', file=sys.stderr)
    # Don't exit with error - let the application start anyway
EOF
else
    echo "Superuser environment variables not set. Skipping superuser creation."
    echo "To create a superuser automatically, set: DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_PASSWORD, DJANGO_SUPERUSER_EMAIL"
fi

# Execute the main command (passed as arguments to this script)
echo "Starting application..."
exec "$@"
