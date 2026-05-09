"""
Report selectors — all report queries live here.
"""
from django.db.models import Sum, Q
from apps.finance.models import Expense, Income
from apps.chickens.models import ChickenMovement, MovementTypeEnum
from apps.feed.models import FeedTransaction, TransactionTypeEnum
from apps.employees.models import Employee
from apps.farms.selectors import get_user_farms


def _farm_filter(user, farm_id=None, province_id=None):
    qs = get_user_farms(user)
    if farm_id:
        qs = qs.filter(id=farm_id)
    if province_id:
        qs = qs.filter(province_id=province_id)
    return qs.values_list("id", flat=True)


def get_profit_loss_report(user, date_from=None, date_to=None, farm_id=None, province_id=None) -> dict:
    farm_ids = _farm_filter(user, farm_id, province_id)

    income_qs = Income.objects.filter(farm_id__in=farm_ids, is_approved=True)
    expense_qs = Expense.objects.filter(farm_id__in=farm_ids, is_approved=True)

    if date_from:
        income_qs = income_qs.filter(income_date__gte=date_from)
        expense_qs = expense_qs.filter(expense_date__gte=date_from)
    if date_to:
        income_qs = income_qs.filter(income_date__lte=date_to)
        expense_qs = expense_qs.filter(expense_date__lte=date_to)

    total_income = income_qs.aggregate(total=Sum("amount"))["total"] or 0
    total_expenses = expense_qs.aggregate(total=Sum("amount"))["total"] or 0

    return {
        "total_income": float(total_income),
        "total_expenses": float(total_expenses),
        "net_profit": float(total_income - total_expenses),
    }


def get_chicken_movement_report(user, date_from=None, date_to=None, farm_id=None) -> dict:
    farm_ids = _farm_filter(user, farm_id)
    qs = ChickenMovement.objects.filter(farm_id__in=farm_ids)
    if date_from:
        qs = qs.filter(movement_date__gte=date_from)
    if date_to:
        qs = qs.filter(movement_date__lte=date_to)

    result = qs.aggregate(
        total_in=Sum("quantity", filter=Q(type=MovementTypeEnum.IN)),
        total_out=Sum("quantity", filter=Q(type=MovementTypeEnum.OUT)),
    )
    return {
        "total_in": result["total_in"] or 0,
        "total_out": result["total_out"] or 0,
        "net": (result["total_in"] or 0) - (result["total_out"] or 0),
    }


def get_mortality_report(user, date_from=None, date_to=None, farm_id=None) -> dict:
    farm_ids = _farm_filter(user, farm_id)
    qs = ChickenMovement.objects.filter(
        farm_id__in=farm_ids, type=MovementTypeEnum.OUT, reason="mortality"
    )
    if date_from:
        qs = qs.filter(movement_date__gte=date_from)
    if date_to:
        qs = qs.filter(movement_date__lte=date_to)
    total = qs.aggregate(total=Sum("quantity"))["total"] or 0
    return {"total_mortality": total}


def get_feed_consumption_report(user, date_from=None, date_to=None, farm_id=None) -> dict:
    farm_ids = _farm_filter(user, farm_id)
    qs = FeedTransaction.objects.filter(farm_id__in=farm_ids)
    if date_from:
        qs = qs.filter(transaction_date__gte=date_from)
    if date_to:
        qs = qs.filter(transaction_date__lte=date_to)

    result = qs.aggregate(
        total_in=Sum("quantity", filter=Q(type=TransactionTypeEnum.IN)),
        total_out=Sum("quantity", filter=Q(type=TransactionTypeEnum.OUT)),
    )
    return {
        "total_received": float(result["total_in"] or 0),
        "total_consumed": float(result["total_out"] or 0),
        "remaining": float((result["total_in"] or 0) - (result["total_out"] or 0)),
    }
