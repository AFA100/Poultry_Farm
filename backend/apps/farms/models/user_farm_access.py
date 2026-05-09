from django.db import models
from django.conf import settings
from .farm import Farm


class UserFarmAccess(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="farm_access")
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="user_access")

    class Meta:
        db_table = "user_farm_access"
        unique_together = ("user", "farm")
