from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.chickens.models import ChickenBatch, ChickenMovement, MovementTypeEnum
from apps.chickens.selectors import get_batch_available_quantity, get_farm_live_chickens
from apps.audit_logs.services import log_action
from apps.common.cache import invalidate_farm_dashboards


@transaction.atomic
def create_batch(data: dict, performed_by=None) -> ChickenBatch:
    batch = ChickenBatch.objects.create(**data)
    # Auto-create the initial IN movement
    ChickenMovement.objects.create(
        farm=batch.farm,
        batch=batch,
        type=MovementTypeEnum.IN,
        quantity=batch.quantity,
        movement_date=batch.entry_date,
        reason="initial_entry",
    )
    log_action(performed_by, "create", "ChickenBatch", batch.id, {"farm": str(batch.farm_id), "quantity": batch.quantity})
    invalidate_farm_dashboards(batch.farm_id, getattr(batch.farm, "province_id", None))
    return batch


@transaction.atomic
def create_movement(data: dict, performed_by=None) -> ChickenMovement:
    batch = data["batch"]
    movement_type = data["type"]
    quantity = data["quantity"]

    if movement_type == MovementTypeEnum.OUT:
        available = get_batch_available_quantity(batch.id)
        if quantity > available:
            raise ValidationError(
                f"OUT quantity ({quantity}) exceeds available batch quantity ({available})."
            )

    # Enforce farm capacity on IN movements
    if movement_type == MovementTypeEnum.IN:
        farm = data["farm"]
        live = get_farm_live_chickens(farm.id)
        if farm.capacity > 0 and (live + quantity) > farm.capacity:
            raise ValidationError(
                f"Adding {quantity} chickens would exceed farm capacity ({farm.capacity}). Current: {live}."
            )

    movement = ChickenMovement.objects.create(**data)
    log_action(performed_by, "create", "ChickenMovement", movement.id, {
        "type": movement_type,
        "quantity": quantity,
        "batch": str(batch.id),
    })
    invalidate_farm_dashboards(data["farm"].id, getattr(data["farm"], "province_id", None))
    return movement
