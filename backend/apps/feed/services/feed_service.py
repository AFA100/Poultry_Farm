from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.feed.models import FeedInventory, FeedTransaction, TransactionTypeEnum
from apps.feed.selectors import get_farm_feed_remaining
from apps.audit_logs.services import log_action
from apps.common.cache import invalidate_farm_dashboards


@transaction.atomic
def create_feed_transaction(data: dict, performed_by=None) -> FeedTransaction:
    farm = data["farm"]
    tx_type = data["type"]
    quantity = data["quantity"]

    if tx_type == TransactionTypeEnum.OUT:
        remaining = get_farm_feed_remaining(farm.id)
        if quantity > remaining:
            raise ValidationError(
                f"OUT quantity ({quantity}) exceeds available feed ({remaining})."
            )

    tx = FeedTransaction.objects.create(**data)

    # Update snapshot inventory
    inventory, _ = FeedInventory.objects.get_or_create(
        farm=farm,
        defaults={"quantity": 0, "unit": data["unit"]},
    )
    if tx_type == TransactionTypeEnum.IN:
        inventory.quantity += quantity
    else:
        inventory.quantity -= quantity
        if inventory.quantity < 0:
            inventory.quantity = 0
    inventory.unit = data["unit"]
    inventory.save()

    log_action(performed_by, "create", "FeedTransaction", tx.id, {
        "type": tx_type,
        "quantity": float(quantity),
        "farm": str(farm.id),
    })
    invalidate_farm_dashboards(farm.id, getattr(farm, "province_id", None))
    return tx
