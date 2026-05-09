from rest_framework.generics import ListAPIView
from apps.audit_logs.models import AuditLog
from apps.audit_logs.api.serializers import AuditLogSerializer
from apps.permissions.permissions import require_permission


class AuditLogListView(ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [require_permission("audit_logs.view")]
    filterset_fields = ["action", "entity_name", "user"]
    search_fields = ["action", "entity_name"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        return AuditLog.objects.select_related("user").order_by("-created_at")
