from django.db import models
from django.conf import settings
from .province import Province


class UserProvinceAccess(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="province_access")
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name="user_access")

    class Meta:
        db_table = "user_province_access"
        unique_together = ("user", "province")
