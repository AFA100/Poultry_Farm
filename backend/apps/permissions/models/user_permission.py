from django.db import models
from django.conf import settings
from .permission import Permission


class UserPermission(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_permissions_direct")
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name="user_permissions")

    class Meta:
        db_table = "user_permissions"
        unique_together = ("user", "permission")
