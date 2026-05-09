from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied

from apps.permissions.models import Role
from apps.permissions.api.serializers import (
    RoleListSerializer, RoleDetailSerializer,
    RoleCreateSerializer, RoleUpdateSerializer,
)
from apps.permissions.permissions import require_permission
from apps.common.responses import success_response, created_response
from apps.audit_logs.services import log_action


class RoleListCreateView(ListCreateAPIView):
    queryset = Role.objects.all().order_by("name")

    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("roles.create")()]
        return [require_permission("roles.view")()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return RoleCreateSerializer
        return RoleListSerializer

    def perform_create(self, serializer):
        role = serializer.save()
        log_action(self.request.user, "create", "Role", role.id, {"name": role.name})


class RoleDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    lookup_field = "id"

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [require_permission("roles.update")()]
        if self.request.method == "DELETE":
            return [require_permission("roles.delete")()]
        return [require_permission("roles.view")()]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return RoleUpdateSerializer
        return RoleDetailSerializer

    def perform_destroy(self, instance):
        if instance.is_system:
            raise PermissionDenied("System roles cannot be deleted.")
        log_action(self.request.user, "delete", "Role", instance.id, {"name": instance.name})
        instance.delete()
