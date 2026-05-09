from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.provinces.models import Province
from apps.audit_logs.services import log_action


@transaction.atomic
def create_province(name: str, performed_by=None) -> Province:
    if Province.objects.filter(name__iexact=name).exists():
        raise ValidationError("Province with this name already exists.")
    province = Province.objects.create(name=name)
    log_action(performed_by, "create", "Province", province.id, {"name": name})
    return province


@transaction.atomic
def update_province(province: Province, name: str, performed_by=None) -> Province:
    if Province.objects.filter(name__iexact=name).exclude(id=province.id).exists():
        raise ValidationError("Province with this name already exists.")
    province.name = name
    province.save(update_fields=["name"])
    log_action(performed_by, "update", "Province", province.id, {"name": name})
    return province


@transaction.atomic
def delete_province(province: Province, performed_by=None):
    if province.farms.exists():
        raise ValidationError("Cannot delete province with existing farms.")
    log_action(performed_by, "delete", "Province", province.id, {"name": province.name})
    province.delete()
