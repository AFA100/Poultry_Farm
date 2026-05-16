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


@transaction.atomic
def update_feed_transaction(transaction: FeedTransaction, data: dict, performed_by=None) -> FeedTransaction:
    farm = transaction.farm
    new_type = data.get("type", transaction.type)
    new_quantity = data.get("quantity", transaction.quantity)
    new_unit = data.get("unit", transaction.unit)

    if new_quantity <= 0:
        raise ValidationError("Quantity must be greater than zero.")

    if new_type == TransactionTypeEnum.OUT:
        remaining = get_farm_feed_remaining(farm.id, exclude_transaction_id=transaction.id)
        if new_quantity > remaining:
            raise ValidationError(
                f"OUT quantity ({new_quantity}) exceeds available feed ({remaining})."
            )

    if new_type == TransactionTypeEnum.IN:
        # For inventory snapshot, ensure unit remains consistent or update it.
        inventory, _ = FeedInventory.objects.get_or_create(
            farm=farm,
            defaults={"quantity": 0, "unit": new_unit},
        )
        inventory.unit = new_unit
        inventory.save(update_fields=["unit"])

    old_quantity = transaction.quantity
    old_type = transaction.type
    transaction.type = new_type
    transaction.quantity = new_quantity
    transaction.unit = new_unit
    transaction.transaction_date = data.get("transaction_date", transaction.transaction_date)
    transaction.note = data.get("note", transaction.note)
    transaction.save()

    # Rebuild inventory snapshot for the farm.
    inventory, _ = FeedInventory.objects.get_or_create(
        farm=farm,
        defaults={"quantity": 0, "unit": transaction.unit},
    )
    inventory.quantity = get_farm_feed_remaining(farm.id)
    inventory.unit = transaction.unit
    inventory.save()

    log_action(performed_by, "update", "FeedTransaction", transaction.id, {
        "old_type": old_type,
        "old_quantity": float(old_quantity),
        "new_type": new_type,
        "new_quantity": float(new_quantity),
    })
    invalidate_farm_dashboards(farm.id, getattr(farm, "province_id", None))
    return transaction


@transaction.atomic
def delete_feed_transaction(transaction: FeedTransaction, performed_by=None):
    farm = transaction.farm
    log_action(performed_by, "delete", "FeedTransaction", transaction.id, {
        "type": transaction.type,
        "quantity": float(transaction.quantity),
    })
    transaction.delete()

    inventory, _ = FeedInventory.objects.get_or_create(
        farm=farm,
        defaults={"quantity": 0, "unit": transaction.unit},
    )
    inventory.quantity = get_farm_feed_remaining(farm.id)
    inventory.unit = transaction.unit
    inventory.save()
    invalidate_farm_dashboards(farm.id, getattr(farm, "province_id", None))
    return None
