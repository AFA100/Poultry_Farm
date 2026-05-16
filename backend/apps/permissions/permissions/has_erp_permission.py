"""
Custom DRF permission class enforcing full RBAC check on every request.
Usage:
    permission_classes = [HasERPPermission("farms.view")]
"""
from rest_framework.permissions import BasePermission
from apps.permissions.services import has_permission


class HasERPPermission(BasePermission):
    """
    Checks:
    1. JWT authenticated
    2. User is active
    3. User has the required permission (direct or via role)
    """

    def __init__(self, permission_key: str = None):
        if permission_key is not None:
            self.permission_key = permission_key
        if not hasattr(self, "permission_key"):
            raise ValueError("HasERPPermission requires a permission_key")

    # DRF calls has_permission on every request
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not request.user.is_active:
            return False
        return has_permission(request.user, self.permission_key)


def require_permission(permission_key: str):
    """
    Factory helper so views can do:
        permission_classes = [require_permission("farms.view")]
    """
    return type(
        f"HasPerm_{permission_key.replace('.', '_')}",
        (HasERPPermission,),
        {"permission_key": permission_key},
    )
