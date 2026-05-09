from django.db.models import Sum
from apps.finance.models import Expense, Income, Capital
from apps.farms.selectors import get_user_farms


def _farm_ids(user):
    return get_user_farms(user).values_list("id", flat=True)


def get_expenses(user, filters: dict = None):
    qs = Expense.objects.filter(farm_id__in=_farm_ids(user)).select_related("farm").only(
        "id", "farm_id", "farm__name", "category", "amount", "expense_date", "is_approved", "created_at"
    )
    if filters:
        if filters.get("farm"):
            qs = qs.filter(farm_id=filters["farm"])
        if filters.get("is_approved") is not None:
            qs = qs.filter(is_approved=filters["is_approved"])
        if filters.get("date_from"):
            qs = qs.filter(expense_date__gte=filters["date_from"])
        if filters.get("date_to"):
            qs = qs.filter(expense_date__lte=filters["date_to"])
    return qs.order_by("-created_at")


def get_income(user, filters: dict = None):
    qs = Income.objects.filter(farm_id__in=_farm_ids(user)).select_related("farm").only(
        "id", "farm_id", "farm__name", "source", "amount", "income_date", "is_approved", "created_at"
    )
    if filters:
        if filters.get("farm"):
            qs = qs.filter(farm_id=filters["farm"])
        if filters.get("is_approved") is not None:
            qs = qs.filter(is_approved=filters["is_approved"])
        if filters.get("date_from"):
            qs = qs.filter(income_date__gte=filters["date_from"])
        if filters.get("date_to"):
            qs = qs.filter(income_date__lte=filters["date_to"])
    return qs.order_by("-created_at")


def get_capital(user, filters: dict = None):
    qs = Capital.objects.filter(farm_id__in=_farm_ids(user)).select_related("farm")
    if filters:
        if filters.get("farm"):
            qs = qs.filter(farm_id=filters["farm"])
    return qs.order_by("-created_at")


def get_farm_profit(farm_id) -> dict:
    total_income = Income.objects.filter(farm_id=farm_id, is_approved=True).aggregate(
        total=Sum("amount")
    )["total"] or 0
    total_expenses = Expense.objects.filter(farm_id=farm_id, is_approved=True).aggregate(
        total=Sum("amount")
    )["total"] or 0
    return {
        "total_income": float(total_income),
        "total_expenses": float(total_expenses),
        "net_profit": float(total_income - total_expenses),
    }
