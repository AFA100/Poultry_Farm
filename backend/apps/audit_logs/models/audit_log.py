import uuid
from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=100)
    entity_name = models.CharField(max_length=100)
    entity_id = models.UUIDField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["entity_name", "entity_id"], name="idx_audit_entity"),
            models.Index(fields=["user_id", "created_at"], name="idx_audit_user_time"),
            models.Index(fields=["action"], name="idx_audit_action"),
        ]
        # Audit logs are immutable — no update allowed at DB level via app logic

    def __str__(self):
        return f"{self.action} on {self.entity_name} by {self.user_id}"
