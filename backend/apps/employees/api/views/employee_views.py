from rest_framework.views import APIView
from rest_framework.generics import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from apps.employees.models import Employee
from apps.employees.api.serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer,
    EmployeeCreateSerializer, EmployeeUpdateSerializer,
)
from apps.employees.selectors import get_employees
from apps.employees.services import create_employee, update_employee, delete_employee
from apps.farms.selectors import user_has_farm_access
from apps.permissions.permissions import require_permission
from apps.common.responses import success_response, created_response
from apps.common.pagination import StandardResultsPagination


class EmployeeListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("employees.create")()]
        return [require_permission("employees.view")()]

    def get(self, request):
        filters = {
            "farm": request.query_params.get("farm"),
            "status": request.query_params.get("status"),
            "role": request.query_params.get("role"),
        }
        qs = get_employees(request.user, filters)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(EmployeeListSerializer(page, many=True).data)

    def post(self, request):
        serializer = EmployeeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farm = serializer.validated_data["farm"]
        if not user_has_farm_access(request.user, farm.id):
            raise PermissionDenied("You do not have access to this farm.")
        employee = create_employee(serializer.validated_data, performed_by=request.user)
        return created_response(data=EmployeeDetailSerializer(employee).data)


class EmployeeDetailView(APIView):

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [require_permission("employees.update")()]
        if self.request.method == "DELETE":
            return [require_permission("employees.delete")()]
        return [require_permission("employees.view")()]

    def _get_employee(self, request, employee_id):
        employee = get_object_or_404(Employee, id=employee_id)
        if not user_has_farm_access(request.user, employee.farm_id):
            raise PermissionDenied("You do not have access to this employee's farm.")
        return employee

    def get(self, request, employee_id):
        employee = self._get_employee(request, employee_id)
        return success_response(data=EmployeeDetailSerializer(employee).data)

    def put(self, request, employee_id):
        employee = self._get_employee(request, employee_id)
        serializer = EmployeeUpdateSerializer(employee, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        employee = update_employee(employee, serializer.validated_data, performed_by=request.user)
        return success_response(data=EmployeeDetailSerializer(employee).data)

    def delete(self, request, employee_id):
        employee = self._get_employee(request, employee_id)
        delete_employee(employee, performed_by=request.user)
        return success_response(message="Employee deleted.")
