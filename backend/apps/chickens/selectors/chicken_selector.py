from django.db.models import Sum, Q
from apps.chickens.models import ChickenBatch, ChickenMovement, MovementTypeEnum
from apps.farms.selectors import get_user_farms


def get_batches(user, filters: dict = None):
    farm_ids = get_user_farms(user).values_list("id", flat=True)
    qs = ChickenBatch.objects.filter(farm_id__in=farm_ids).select_related("farm")
    if filters:
        if filters.get("farm"):
            qs = qs.filter(farm_id=filters["farm"])
        if filters.get("status"):
            qs = qs.filter(status=filters["status"])
    return qs.order_by("-created_at")


def get_movements(user, filters: dict = None):
    farm_ids = get_user_farms(user).values_list("id", flat=True)
    qs = ChickenMovement.objects.filter(farm_id__in=farm_ids).select_related("farm", "batch")
    if filters:
        if filters.get("farm"):
            qs = qs.filter(farm_id=filters["farm"])
        if filters.get("type"):
            qs = qs.filter(type=filters["type"])
        if filters.get("batch"):
            qs = qs.filter(batch_id=filters["batch"])
    return qs.order_by("-created_at")


def get_batch_available_quantity(batch_id) -> int:
    """Returns current live quantity for a batch: SUM(IN) - SUM(OUT)."""
    result = ChickenMovement.objects.filter(batch_id=batch_id).aggregate(
        total_in=Sum("quantity", filter=Q(type=MovementTypeEnum.IN)),
        total_out=Sum("quantity", filter=Q(type=MovementTypeEnum.OUT)),
    )
    total_in = result["total_in"] or 0
    total_out = result["total_out"] or 0
    return total_in - total_out


def get_farm_live_chickens(farm_id) -> int:
    """Total live chickens across all batches for a farm."""
    result = ChickenMovement.objects.filter(farm_id=farm_id).aggregate(
        total_in=Sum("quantity", filter=Q(type=MovementTypeEnum.IN)),
        total_out=Sum("quantity", filter=Q(type=MovementTypeEnum.OUT)),
    )
    return (result["total_in"] or 0) - (result["total_out"] or 0)
