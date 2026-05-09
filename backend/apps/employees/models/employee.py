import uuid
from django.db import models
from apps.farms.models import Farm


class EmployeeRoleEnum(models.TextChoices):
    FARMER = "farmer", "Farmer"
    WORKER = "worker", "Worker"
    MANAGER = "manager", "Manager"


class StatusEnum(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"


class Employee(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.PROTECT, related_name="employees")
    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=EmployeeRoleEnum.choices)
    salary = models.DecimalField(max_digits=12, decimal_places=2)
    hire_date = models.DateField()
    status = models.CharField(max_length=10, choices=StatusEnum.choices, default=StatusEnum.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "employees"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.farm.name})"
