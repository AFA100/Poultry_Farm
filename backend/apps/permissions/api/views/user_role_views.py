from rest_framework.views import APIView
from rest_framework.generics import get_object_or_404

from apps.users.models import User
from apps.permissions.models import UserRole, UserPermission
from apps.permissions.api.serializers import AssignRoleSerializer, AssignDirectPermissionSerializer
from apps.permissions.api.serializers.user_role_serializer import UserRoleSerializer, UserPermissionSerializer
from apps.permissions.services import assign_roles_to_user, assign_direct_permissions_to_user
from apps.permissions.permissions import require_permission
from apps.common.responses import success_response


class UserRolesView(APIView):
    """GET/PUT roles for a specific user."""

    def get_permissions(self):
        return [require_permission("roles.manage")()]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        roles = UserRole.objects.filter(user=user).select_related("role")
        return success_response(data=UserRoleSerializer(roles, many=True).data)

    def put(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        serializer = AssignRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assign_roles_to_user(user, serializer.validated_data["role_ids"], performed_by=request.user)
        return success_response(message="Roles assigned successfully.")


class UserDirectPermissionsView(APIView):
    """GET/PUT direct permissions for a specific user."""

    def get_permissions(self):
        return [require_permission("permissions.manage")()]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        perms = UserPermission.objects.filter(user=user).select_related("permission")
        return success_response(data=UserPermissionSerializer(perms, many=True).data)

    def put(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        serializer = AssignDirectPermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assign_direct_permissions_to_user(user, serializer.validated_data["permission_ids"], performed_by=request.user)
        return success_response(message="Permissions assigned successfully.")
