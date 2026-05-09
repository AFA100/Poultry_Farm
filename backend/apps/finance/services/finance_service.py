from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.finance.models import Expense, Income, Capital
from apps.audit_logs.services import log_action
from apps.common.cache import invalidate_farm_dashboards, invalidate_reports


# ── Expenses ──────────────────────────────────────────────────────────────────

@transaction.atomic
def create_expense(data: dict, performed_by=None) -> Expense:
    expense = Expense.objects.create(**data)
    log_action(performed_by, "create", "Expense", expense.id, {"amount": float(expense.amount)})
    invalidate_farm_dashboards(expense.farm_id)
    return expense


@transaction.atomic
def update_expense(expense: Expense, data: dict, performed_by=None) -> Expense:
    if expense.is_approved:
        raise ValidationError("Approved expenses cannot be edited.")
    for attr, value in data.items():
        setattr(expense, attr, value)
    expense.save()
    log_action(performed_by, "update", "Expense", expense.id, data)
    return expense


@transaction.atomic
def approve_expense(expense: Expense, performed_by=None) -> Expense:
    if expense.is_approved:
        raise ValidationError("Expense is already approved.")
    expense.is_approved = True
    expense.save(update_fields=["is_approved"])
    log_action(performed_by, "approve", "Expense", expense.id, {"amount": float(expense.amount)})
    invalidate_farm_dashboards(expense.farm_id)
    invalidate_reports()
    return expense


# ── Income ────────────────────────────────────────────────────────────────────

@transaction.atomic
def create_income(data: dict, performed_by=None) -> Income:
    income = Income.objects.create(**data)
    log_action(performed_by, "create", "Income", income.id, {"amount": float(income.amount)})
    invalidate_farm_dashboards(income.farm_id)
    return income


@transaction.atomic
def update_income(income: Income, data: dict, performed_by=None) -> Income:
    if income.is_approved:
        raise ValidationError("Approved income records cannot be edited.")
    for attr, value in data.items():
        setattr(income, attr, value)
    income.save()
    log_action(performed_by, "update", "Income", income.id, data)
    return income


@transaction.atomic
def approve_income(income: Income, performed_by=None) -> Income:
    if income.is_approved:
        raise ValidationError("Income is already approved.")
    income.is_approved = True
    income.save(update_fields=["is_approved"])
    log_action(performed_by, "approve", "Income", income.id, {"amount": float(income.amount)})
    invalidate_farm_dashboards(income.farm_id)
    invalidate_reports()
    return income


# ── Capital ───────────────────────────────────────────────────────────────────

@transaction.atomic
def create_capital(data: dict, performed_by=None) -> Capital:
    capital = Capital.objects.create(**data)
    log_action(performed_by, "create", "Capital", capital.id, {"amount": float(capital.amount)})
    invalidate_farm_dashboards(capital.farm_id)
    return capital


@transaction.atomic
def approve_capital(capital: Capital, performed_by=None) -> Capital:
    if capital.is_approved:
        raise ValidationError("Capital entry is already approved.")
    capital.is_approved = True
    capital.save(update_fields=["is_approved"])
    log_action(performed_by, "approve", "Capital", capital.id, {"amount": float(capital.amount)})
    return capital
