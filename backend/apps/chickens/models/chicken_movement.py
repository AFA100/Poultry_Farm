import uuid
from django.db import models
from apps.farms.models import Farm
from .chicken_batch import ChickenBatch


class MovementTypeEnum(models.TextChoices):
    IN = "IN", "IN"
    OUT = "OUT", "OUT"


class ChickenMovement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.PROTECT, related_name="chicken_movements")
    batch = models.ForeignKey(ChickenBatch, on_delete=models.PROTECT, related_name="movements")
    type = models.CharField(max_length=3, choices=MovementTypeEnum.choices)
    quantity = models.IntegerField()
    movement_date = models.DateField()
    reason = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chicken_movements"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["farm_id", "type"], name="idx_chicken_mov_farm_type"),
            models.Index(fields=["batch_id", "type"], name="idx_chicken_mov_batch_type"),
            models.Index(fields=["movement_date"], name="idx_chicken_mov_date"),
            models.Index(fields=["farm_id", "reason"], name="idx_chicken_mov_farm_reason"),
        ]

    def __str__(self):
        return f"{self.type} {self.quantity} — {self.farm.name}"
