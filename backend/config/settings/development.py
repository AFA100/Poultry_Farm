"""
Development settings.
"""
from .base import *  # noqa

DEBUG = True

INSTALLED_APPS += ["debug_toolbar"]  # noqa

MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]  # noqa

INTERNAL_IPS = ["127.0.0.1"]

# Relaxed CORS for local dev
CORS_ALLOW_ALL_ORIGINS = True

# Show SQL queries in dev
LOGGING["loggers"]["django.db.backends"]["level"] = "DEBUG"  # noqa
