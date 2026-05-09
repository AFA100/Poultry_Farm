from rest_framework.generics import ListAPIView
from apps.permissions.models import Permission, PermissionGroup
from apps.permissions.api.serializers import PermissionSerializer, PermissionGroupSerializer
from apps.permissions.permissions import require_permission


class PermissionListView(ListAPIView):
    queryset = Permission.objects.select_related("group").order_by("module", "action")
    serializer_class = PermissionSerializer
    permission_classes = [require_permission("permissions.view")]
    filterset_fields = ["module", "action", "is_system"]
    search_fields = ["permission_key", "module", "action"]


class PermissionGroupListView(ListAPIView):
    queryset = PermissionGroup.objects.all().order_by("name")
    serializer_class = PermissionGroupSerializer
    permission_classes = [require_permission("permissions.view")]
