"""
Dashboard selectors — all metrics come from here, never from views or frontend.
All results are Redis-cached. Cache is invalidated by services on data change.
"""
from django.db.models import Sum, Q
from django.core.cache import cache

from apps.provinces.models import Province
from apps.farms.models import Farm
from apps.employees.models import Employee
from apps.chickens.models import ChickenMovement, MovementTypeEnum
from apps.feed.models import FeedTransaction, TransactionTypeEnum
from apps.finance.models import Expense, Income, Capital
from apps.common.cache import (
    key_global_dashboard, key_province_dashboard, key_farm_dashboard,
    DASHBOARD_TTL,
)


def get_global_dashboard(user) -> dict:
    cache_key = key_global_dashboard(str(user.id))
    cached = cache.get(cache_key)
    if cached:
        return cached

    data = {
        "total_provinces": Province.objects.count(),
        "total_farms": Farm.objects.filter(is_active=True).count(),
        "total_employees": Employee.objects.filter(status="active").count(),
        "total_chickens": _total_chickens(),
        "total_feed_remaining": _total_feed_remaining(),
        "total_expenses": _sum(Expense, "amount"),
        "total_income": _sum(Income, "amount"),
        "total_capital": _sum(Capital, "amount"),
        "net_profit": _sum(Income, "amount") - _sum(Expense, "amount"),
    }

    cache.set(cache_key, data, DASHBOARD_TTL)
    return data


def get_province_dashboard(province_id) -> dict:
    cache_key = key_province_dashboard(province_id)
    cached = cache.get(cache_key)
    if cached:
        return cached

    farm_ids = list(
        Farm.objects.filter(province_id=province_id, is_active=True).values_list("id", flat=True)
    )

    data = {
        "total_farms": len(farm_ids),
        "total_employees": Employee.objects.filter(farm_id__in=farm_ids, status="active").count(),
        "total_chickens": _total_chickens(farm_ids),
        "total_feed_remaining": _total_feed_remaining(farm_ids),
        "total_expenses": _sum(Expense, "amount", farm_ids),
        "total_income": _sum(Income, "amount", farm_ids),
        "net_profit": _sum(Income, "amount", farm_ids) - _sum(Expense, "amount", farm_ids),
    }

    cache.set(cache_key, data, DASHBOARD_TTL)
    return data


def get_farm_dashboard(farm_id) -> dict:
    cache_key = key_farm_dashboard(farm_id)
    cached = cache.get(cache_key)
    if cached:
        return cached

    farm_ids = [farm_id]
    data = {
        "live_chickens": _total_chickens(farm_ids),
        "feed_remaining": _total_feed_remaining(farm_ids),
        "total_employees": Employee.objects.filter(farm_id=farm_id, status="active").count(),
        "total_expenses": _sum(Expense, "amount", farm_ids),
        "total_income": _sum(Income, "amount", farm_ids),
        "total_capital": _sum(Capital, "amount", farm_ids),
        "net_profit": _sum(Income, "amount", farm_ids) - _sum(Expense, "amount", farm_ids),
        "mortality": _mortality_count(farm_id),
    }

    cache.set(cache_key, data, DASHBOARD_TTL)
    return data


# ── Helpers ───────────────────────────────────────────────────────────────────

def _total_chickens(farm_ids=None) -> int:
    qs = ChickenMovement.objects
    if farm_ids is not None:
        qs = qs.filter(farm_id__in=farm_ids)
    result = qs.aggregate(
        total_in=Sum("quantity", filter=Q(type=MovementTypeEnum.IN)),
        total_out=Sum("quantity", filter=Q(type=MovementTypeEnum.OUT)),
    )
    return (result["total_in"] or 0) - (result["total_out"] or 0)


def _total_feed_remaining(farm_ids=None) -> float:
    qs = FeedTransaction.objects
    if farm_ids is not None:
        qs = qs.filter(farm_id__in=farm_ids)
    result = qs.aggregate(
        total_in=Sum("quantity", filter=Q(type=TransactionTypeEnum.IN)),
        total_out=Sum("quantity", filter=Q(type=TransactionTypeEnum.OUT)),
    )
    return float((result["total_in"] or 0) - (result["total_out"] or 0))


def _sum(model, field, farm_ids=None) -> float:
    qs = model.objects
    if farm_ids is not None:
        qs = qs.filter(farm_id__in=farm_ids)
    result = qs.aggregate(total=Sum(field))
    return float(result["total"] or 0)


def _mortality_count(farm_id) -> int:
    result = ChickenMovement.objects.filter(
        farm_id=farm_id, type=MovementTypeEnum.OUT, reason="mortality"
    ).aggregate(total=Sum("quantity"))
    return result["total"] or 0
