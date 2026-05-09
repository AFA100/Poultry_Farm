import uuid
from django.db import models
from apps.provinces.models import Province


class Farm(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    province = models.ForeignKey(Province, on_delete=models.PROTECT, related_name="farms")
    name = models.CharField(max_length=150)
    location = models.TextField(blank=True, null=True)
    capacity = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "farms"
        unique_together = ("province", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.province.name})"
