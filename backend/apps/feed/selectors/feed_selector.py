from django.db.models import Sum, Q
from apps.feed.models import FeedInventory, FeedTransaction, TransactionTypeEnum
from apps.farms.selectors import get_user_farms


def get_feed_inventory(user, farm_id=None):
    farm_ids = get_user_farms(user).values_list("id", flat=True)
    qs = FeedInventory.objects.filter(farm_id__in=farm_ids).select_related("farm")
    if farm_id:
        qs = qs.filter(farm_id=farm_id)
    return qs


def get_feed_transactions(user, filters: dict = None):
    farm_ids = get_user_farms(user).values_list("id", flat=True)
    qs = FeedTransaction.objects.filter(farm_id__in=farm_ids).select_related("farm")
    if filters:
        if filters.get("farm"):
            qs = qs.filter(farm_id=filters["farm"])
        if filters.get("type"):
            qs = qs.filter(type=filters["type"])
    return qs.order_by("-created_at")


def get_farm_feed_remaining(farm_id, exclude_transaction_id=None) -> float:
    qs = FeedTransaction.objects.filter(farm_id=farm_id)
    if exclude_transaction_id:
        qs = qs.exclude(id=exclude_transaction_id)

    result = qs.aggregate(
        total_in=Sum("quantity", filter=Q(type=TransactionTypeEnum.IN)),
        total_out=Sum("quantity", filter=Q(type=TransactionTypeEnum.OUT)),
    )
    return float((result["total_in"] or 0) - (result["total_out"] or 0))
