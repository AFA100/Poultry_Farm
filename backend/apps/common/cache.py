"""
Centralized cache key registry and invalidation helpers.
All cache keys in the system are defined here — no magic strings elsewhere.
"""
from django.core.cache import cache

# TTLs
DASHBOARD_TTL = 300       # 5 min
PERMISSION_TTL = 300      # 5 min
REPORT_TTL = 600          # 10 min
FARM_LIST_TTL = 120       # 2 min


# ── Key builders ──────────────────────────────────────────────────────────────

def key_global_dashboard(user_id: str) -> str:
    return f"global_dashboard:{user_id}"


def key_province_dashboard(province_id) -> str:
    return f"province_dashboard:{province_id}"


def key_farm_dashboard(farm_id) -> str:
    return f"farm_dashboard:{farm_id}"


def key_user_permissions(user_id: str) -> str:
    return f"user_permissions:{user_id}"


def key_report(report_type: str, farm_id=None, province_id=None, date_from=None, date_to=None) -> str:
    return f"report:{report_type}:{farm_id}:{province_id}:{date_from}:{date_to}"


# ── Invalidation helpers ──────────────────────────────────────────────────────

def invalidate_farm_dashboards(farm_id, province_id=None):
    """Call after any farm-level data change (movement, transaction, finance)."""
    cache.delete(key_farm_dashboard(str(farm_id)))
    if province_id:
        cache.delete(key_province_dashboard(str(province_id)))
    # Global dashboard is user-scoped — use pattern delete via scan
    _delete_pattern("global_dashboard:*")


def invalidate_province_dashboard(province_id):
    cache.delete(key_province_dashboard(str(province_id)))
    _delete_pattern("global_dashboard:*")


def invalidate_all_dashboards():
    _delete_pattern("global_dashboard:*")
    _delete_pattern("province_dashboard:*")
    _delete_pattern("farm_dashboard:*")


def invalidate_reports():
    _delete_pattern("report:*")


def _delete_pattern(pattern: str):
    """Delete all Redis keys matching a pattern. Uses Django's low-level cache client."""
    try:
        client = cache.client.get_client()  # django-redis
        keys = client.keys(pattern)
        if keys:
            client.delete(*keys)
    except Exception:
        # Graceful degradation — if Redis is unavailable, skip
        pass
