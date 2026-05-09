"""
Role & permission assignment services.
"""
from django.db import transaction
from apps.permissions.models import Role, Permission, UserRole, UserPermission
from apps.permissions.services.rbac_service import invalidate_user_permission_cache
from apps.audit_logs.services import log_action


@transaction.atomic
def assign_roles_to_user(user, role_ids: list, performed_by=None):
    """Replace user's roles with the given list."""
    UserRole.objects.filter(user=user).delete()
    roles = Role.objects.filter(id__in=role_ids, is_active=True)
    UserRole.objects.bulk_create([UserRole(user=user, role=r) for r in roles])
    invalidate_user_permission_cache(str(user.id))
    log_action(performed_by, "assign_roles", "User", user.id, {"role_ids": [str(r) for r in role_ids]})


@transaction.atomic
def assign_direct_permissions_to_user(user, permission_ids: list, performed_by=None):
    """Replace user's direct permissions with the given list."""
    UserPermission.objects.filter(user=user).delete()
    perms = Permission.objects.filter(id__in=permission_ids)
    UserPermission.objects.bulk_create([UserPermission(user=user, permission=p) for p in perms])
    invalidate_user_permission_cache(str(user.id))
    log_action(performed_by, "assign_direct_permissions", "User", user.id, {"permission_ids": [str(p) for p in permission_ids]})
