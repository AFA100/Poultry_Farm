from django.db.models import Count, QuerySet
from apps.provinces.models import Province, UserProvinceAccess


def get_all_provinces() -> QuerySet:
    return Province.objects.annotate(farm_count=Count("farms")).order_by("name")


def get_province_by_id(province_id) -> Province:
    return Province.objects.annotate(farm_count=Count("farms")).get(id=province_id)


def get_user_provinces(user) -> QuerySet:
    """Returns provinces the user has explicit access to (or all if superuser)."""
    if user.is_superuser:
        return get_all_provinces()
    province_ids = UserProvinceAccess.objects.filter(user=user).values_list("province_id", flat=True)
    return Province.objects.filter(id__in=province_ids).annotate(farm_count=Count("farms")).order_by("name")
