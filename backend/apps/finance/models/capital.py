import uuid
from django.db import models
from apps.farms.models import Farm


class Capital(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.PROTECT, related_name="capital_records")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    investment_date = models.DateField()
    note = models.TextField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "capital"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Capital {self.amount} — {self.farm.name}"
