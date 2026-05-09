import uuid
from django.db import models
from apps.farms.models import Farm


class FeedUnitEnum(models.TextChoices):
    BAG = "bag", "Bag"
    KG = "kg", "KG"


class FeedInventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.OneToOneField(Farm, on_delete=models.PROTECT, related_name="feed_inventory")
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit = models.CharField(max_length=5, choices=FeedUnitEnum.choices)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "feed_inventory"

    def __str__(self):
        return f"Feed @ {self.farm.name}: {self.quantity} {self.unit}"
