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
def update_batch(batch: ChickenBatch, data: dict, performed_by=None) -> ChickenBatch:
    new_quantity = data.get("quantity", batch.quantity)
    if new_quantity <= 0:
        raise ValidationError("Quantity must be greater than zero.")

    if new_quantity != batch.quantity:
        remaining = get_batch_available_quantity(batch.id)
        if new_quantity < remaining:
            raise ValidationError(
                f"New batch quantity ({new_quantity}) cannot be less than already used chickens ({remaining})."
            )

        initial_movement = ChickenMovement.objects.filter(batch=batch, reason="initial_entry").first()
        if initial_movement:
            initial_movement.quantity = new_quantity
            initial_movement.movement_date = data.get("entry_date", batch.entry_date)
            initial_movement.save(update_fields=["quantity", "movement_date"])

    for attr, value in data.items():
        setattr(batch, attr, value)
    batch.save()
    log_action(performed_by, "update", "ChickenBatch", batch.id, data)
    invalidate_farm_dashboards(batch.farm_id, getattr(batch.farm, "province_id", None))
    return batch


@transaction.atomic
def delete_batch(batch: ChickenBatch, performed_by=None):
    movements = ChickenMovement.objects.filter(batch=batch)
    for movement in movements:
        log_action(performed_by, "delete", "ChickenMovement", movement.id, {
            "type": movement.type,
            "quantity": movement.quantity,
            "batch": str(batch.id),
        })
    movements.delete()
    log_action(performed_by, "delete", "ChickenBatch", batch.id, {"farm": str(batch.farm_id)})
    batch.delete()
    invalidate_farm_dashboards(batch.farm_id, getattr(batch.farm, "province_id", None))
    return None


@transaction.atomic
def update_movement(movement: ChickenMovement, data: dict, performed_by=None) -> ChickenMovement:
    new_type = data.get("type", movement.type)
    new_quantity = data.get("quantity", movement.quantity)
    if new_quantity <= 0:
        raise ValidationError("Quantity must be greater than zero.")

    if new_type == MovementTypeEnum.OUT:
        available = get_batch_available_quantity(movement.batch_id, exclude_movement_id=movement.id)
        if new_quantity > available:
            raise ValidationError(
                f"OUT quantity ({new_quantity}) exceeds available batch quantity ({available})."
            )

    if new_type == MovementTypeEnum.IN:
        farm = movement.farm
        live = get_farm_live_chickens(farm.id)
        current_in = movement.quantity if movement.type == MovementTypeEnum.IN else 0
        if farm.capacity > 0 and (live - current_in + new_quantity) > farm.capacity:
            raise ValidationError(
                f"Adding {new_quantity} chickens would exceed farm capacity ({farm.capacity}). Current: {live - current_in}."
            )

    for attr, value in data.items():
        setattr(movement, attr, value)
    movement.save()
    log_action(performed_by, "update", "ChickenMovement", movement.id, data)
    invalidate_farm_dashboards(movement.farm_id, getattr(movement.farm, "province_id", None))
    return movement


@transaction.atomic
def delete_movement(movement: ChickenMovement, performed_by=None):
    if movement.reason == "initial_entry":
        raise ValidationError("Initial batch entry movement cannot be deleted.")

    if movement.type == MovementTypeEnum.IN:
        available = get_batch_available_quantity(movement.batch_id, exclude_movement_id=movement.id)
        if available < 0:
            raise ValidationError(
                "Cannot delete this IN movement because later OUT movements already depend on it."
            )

    log_action(performed_by, "delete", "ChickenMovement", movement.id, {
        "type": movement.type,
        "quantity": movement.quantity,
        "batch": str(movement.batch_id),
    })
    movement.delete()
    invalidate_farm_dashboards(movement.farm_id, getattr(movement.farm, "province_id", None))
    return None


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
