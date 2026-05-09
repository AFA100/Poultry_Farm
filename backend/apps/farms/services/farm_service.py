from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.farms.models import Farm
from apps.audit_logs.services import log_action


@transaction.atomic
def create_farm(data: dict, performed_by=None) -> Farm:
    farm = Farm.objects.create(**data)
    log_action(performed_by, "create", "Farm", farm.id, {"name": farm.name})
    return farm


@transaction.atomic
def update_farm(farm: Farm, data: dict, performed_by=None) -> Farm:
    for attr, value in data.items():
        setattr(farm, attr, value)
    farm.save()
    log_action(performed_by, "update", "Farm", farm.id, data)
    return farm


@transaction.atomic
def archive_farm(farm: Farm, performed_by=None) -> Farm:
    farm.is_active = False
    farm.save(update_fields=["is_active"])
    log_action(performed_by, "archive", "Farm", farm.id, {"name": farm.name})
    return farm
