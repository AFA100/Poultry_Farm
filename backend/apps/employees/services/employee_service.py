from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.employees.models import Employee
from apps.audit_logs.services import log_action


@transaction.atomic
def create_employee(data: dict, performed_by=None) -> Employee:
    employee = Employee.objects.create(**data)
    log_action(performed_by, "create", "Employee", employee.id, {"full_name": employee.full_name})
    return employee


@transaction.atomic
def update_employee(employee: Employee, data: dict, performed_by=None) -> Employee:
    for attr, value in data.items():
        setattr(employee, attr, value)
    employee.save()
    log_action(performed_by, "update", "Employee", employee.id, data)
    return employee


@transaction.atomic
def delete_employee(employee: Employee, performed_by=None):
    # Business rule: cannot delete if financial records exist
    from apps.finance.models import Expense
    # Soft-check: employees tied to farm financial history are protected
    log_action(performed_by, "delete", "Employee", employee.id, {"full_name": employee.full_name})
    employee.delete()
