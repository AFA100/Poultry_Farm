from django.db.models import QuerySet
from apps.employees.models import Employee
from apps.farms.selectors import get_user_farms


def get_employees(user, filters: dict = None) -> QuerySet:
    accessible_farm_ids = get_user_farms(user).values_list("id", flat=True)
    qs = Employee.objects.filter(farm_id__in=accessible_farm_ids).select_related("farm")
    if filters:
        if filters.get("farm"):
            qs = qs.filter(farm_id=filters["farm"])
        if filters.get("status"):
            qs = qs.filter(status=filters["status"])
        if filters.get("role"):
            qs = qs.filter(role=filters["role"])
    return qs.order_by("-created_at")
