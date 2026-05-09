import uuid
from django.db import models
from apps.farms.models import Farm
from .feed_inventory import FeedUnitEnum


class TransactionTypeEnum(models.TextChoices):
    IN = "IN", "IN"
    OUT = "OUT", "OUT"


class FeedTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.PROTECT, related_name="feed_transactions")
    type = models.CharField(max_length=3, choices=TransactionTypeEnum.choices)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit = models.CharField(max_length=5, choices=FeedUnitEnum.choices)
    transaction_date = models.DateField()
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "feed_transactions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["farm_id", "type"], name="idx_feed_tx_farm_type"),
            models.Index(fields=["transaction_date"], name="idx_feed_tx_date"),
        ]

    def __str__(self):
        return f"{self.type} {self.quantity}{self.unit} — {self.farm.name}"
