from rest_framework import serializers
from apps.permissions.models import UserRole, UserPermission, Role, Permission


class AssignRoleSerializer(serializers.Serializer):
    role_ids = serializers.ListField(child=serializers.UUIDField())


class AssignDirectPermissionSerializer(serializers.Serializer):
    permission_ids = serializers.ListField(child=serializers.UUIDField())


class UserRoleSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True)
    role_id = serializers.UUIDField(source="role.id", read_only=True)

    class Meta:
        model = UserRole
        fields = ["role_id", "role_name"]


class UserPermissionSerializer(serializers.ModelSerializer):
    permission_key = serializers.CharField(source="permission.permission_key", read_only=True)
    permission_id = serializers.UUIDField(source="permission.id", read_only=True)

    class Meta:
        model = UserPermission
        fields = ["permission_id", "permission_key"]
