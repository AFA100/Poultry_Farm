from django.db.models import QuerySet, Sum, Count
from apps.farms.models import Farm, UserFarmAccess


def get_all_farms(filters: dict = None) -> QuerySet:
    qs = Farm.objects.select_related("province").order_by("name")
    if filters:
        if filters.get("province"):
            qs = qs.filter(province_id=filters["province"])
        if filters.get("is_active") is not None:
            qs = qs.filter(is_active=filters["is_active"])
    return qs


def get_user_farms(user, filters: dict = None) -> QuerySet:
    """Returns farms the user has access to."""
    if user.is_superuser:
        return get_all_farms(filters)
    farm_ids = UserFarmAccess.objects.filter(user=user).values_list("farm_id", flat=True)
    qs = Farm.objects.filter(id__in=farm_ids).select_related("province").order_by("name")
    if filters:
        if filters.get("province"):
            qs = qs.filter(province_id=filters["province"])
        if filters.get("is_active") is not None:
            qs = qs.filter(is_active=filters["is_active"])
    return qs


def user_has_farm_access(user, farm_id) -> bool:
    if user.is_superuser:
        return True
    return UserFarmAccess.objects.filter(user=user, farm_id=farm_id).exists()
