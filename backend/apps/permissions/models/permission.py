import uuid
from django.db import models
from .permission_group import PermissionGroup


class Permission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(PermissionGroup, null=True, blank=True, on_delete=models.SET_NULL, related_name="permissions")
    permission_key = models.CharField(max_length=150, unique=True)
    module = models.CharField(max_length=100)
    action = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "permissions"
        ordering = ["module", "action"]

    def __str__(self):
        return self.permission_key
