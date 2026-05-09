from rest_framework import serializers
from apps.permissions.models import Role, Permission


class RoleListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "description", "is_system", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]


class RoleDetailSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ["id", "name", "description", "is_system", "is_active", "permissions", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_permissions(self, obj):
        return list(obj.permissions.values_list("permission_key", flat=True))


class RoleCreateSerializer(serializers.ModelSerializer):
    permission_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False, default=list
    )

    class Meta:
        model = Role
        fields = ["name", "description", "permission_ids"]

    def create(self, validated_data):
        permission_ids = validated_data.pop("permission_ids", [])
        role = Role.objects.create(**validated_data)
        if permission_ids:
            perms = Permission.objects.filter(id__in=permission_ids)
            role.permissions.set(perms)
        return role


class RoleUpdateSerializer(serializers.ModelSerializer):
    permission_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    class Meta:
        model = Role
        fields = ["name", "description", "is_active", "permission_ids"]

    def update(self, instance, validated_data):
        permission_ids = validated_data.pop("permission_ids", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if permission_ids is not None:
            perms = Permission.objects.filter(id__in=permission_ids)
            instance.permissions.set(perms)
        return instance
