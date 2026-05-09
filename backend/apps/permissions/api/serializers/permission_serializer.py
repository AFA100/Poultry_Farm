from rest_framework import serializers
from apps.permissions.models import Permission, PermissionGroup


class PermissionGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermissionGroup
        fields = ["id", "name", "description", "created_at"]
        read_only_fields = ["id", "created_at"]


class PermissionSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source="group.name", read_only=True)

    class Meta:
        model = Permission
        fields = ["id", "permission_key", "module", "action", "description", "is_system", "group", "group_name", "created_at"]
        read_only_fields = ["id", "created_at"]
