"""
RBAC Service — centralized permission resolution.
All permission checks must go through this service.
"""
from django.core.cache import cache
from apps.permissions.models import UserPermission, UserRole


PERMISSION_CACHE_TTL = 300  # 5 minutes


def _cache_key(user_id: str) -> str:
    return f"user_permissions:{user_id}"


def get_user_permissions(user) -> set:
    """
    Returns a set of permission_key strings for the given user.
    Combines direct permissions + role-based permissions.
    Result is cached in Redis.
    """
    cache_key = _cache_key(str(user.id))
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    # Direct permissions
    direct = set(
        UserPermission.objects.filter(user=user)
        .values_list("permission__permission_key", flat=True)
    )

    # Role-based permissions
    role_based = set(
        UserRole.objects.filter(user=user)
        .values_list("role__permissions__permission_key", flat=True)
    )

    all_permissions = direct | role_based
    all_permissions.discard(None)

    cache.set(cache_key, all_permissions, PERMISSION_CACHE_TTL)
    return all_permissions


def has_permission(user, permission_key: str) -> bool:
    """Check if user has a specific permission."""
    if not user or not user.is_active:
        return False
    if user.is_superuser:
        return True
    return permission_key in get_user_permissions(user)


def invalidate_user_permission_cache(user_id: str):
    """Call this whenever user roles/permissions change."""
    cache.delete(_cache_key(str(user_id)))
