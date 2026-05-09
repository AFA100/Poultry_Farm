#!/bin/bash
# Flush all Redis cache keys for the ERP
# Use when you need a clean cache state in dev

echo "Flushing Redis cache..."
python manage.py shell -c "
from django.core.cache import cache
cache.clear()
print('Cache cleared.')
"
