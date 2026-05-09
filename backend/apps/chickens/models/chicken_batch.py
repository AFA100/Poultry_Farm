import uuid
from django.db import models
from apps.farms.models import Farm


class StatusEnum(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"


class ChickenBatch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.PROTECT, related_name="chicken_batches")
    quantity = models.IntegerField()
    entry_date = models.DateField()
    source = models.CharField(max_length=150, blank=True, null=True)
    cost_per_unit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=10, choices=StatusEnum.choices, default=StatusEnum.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "chicken_batches"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Batch {self.id} — {self.farm.name}"
