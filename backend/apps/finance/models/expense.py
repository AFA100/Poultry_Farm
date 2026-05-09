import uuid
from django.db import models
from apps.farms.models import Farm


class Expense(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.PROTECT, related_name="expenses")
    category = models.CharField(max_length=100, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    expense_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "expenses"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["farm_id", "is_approved"], name="idx_expense_farm_approved"),
            models.Index(fields=["expense_date"], name="idx_expense_date"),
        ]

    def __str__(self):
        return f"Expense {self.amount} — {self.farm.name}"
