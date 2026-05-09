"""
Local development settings — no Redis, no Celery required.
Use this to run the backend with just Python + PostgreSQL.

Set: DJANGO_SETTINGS_MODULE=config.settings.local
"""
from .base import *  # noqa

DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True

# ── Swap Redis cache for in-memory (no Redis needed) ──────────────────────────
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

# ── Disable Celery beat schedule (no Celery worker needed) ───────────────────
CELERY_TASK_ALWAYS_EAGER = True   # Tasks run synchronously inline
CELERY_TASK_EAGER_PROPAGATES = True

# ── Show all SQL queries in terminal ─────────────────────────────────────────
LOGGING["loggers"]["django.db.backends"]["level"] = "DEBUG"  # noqa
