#!/bin/bash
# Quick dev setup script
# Run once after docker-compose up --build

set -e

echo "Running migrations..."
python manage.py migrate

echo "Seeding system permissions..."
python manage.py seed_permissions

echo "Creating superuser (if not exists)..."
python manage.py shell -c "
from apps.users.models import User
if not User.objects.filter(email='admin@poultry.local').exists():
    User.objects.create_superuser(
        email='admin@poultry.local',
        full_name='System Admin',
        password='Admin1234!'
    )
    print('Superuser created: admin@poultry.local / Admin1234!')
else:
    print('Superuser already exists.')
"

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Setup complete."
