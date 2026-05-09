from rest_framework.views import APIView
from rest_framework.generics import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from apps.finance.models import Expense, Income, Capital
from apps.finance.api.serializers import (
    ExpenseListSerializer, ExpenseDetailSerializer, ExpenseCreateSerializer, ExpenseUpdateSerializer,
    IncomeListSerializer, IncomeCreateSerializer, IncomeUpdateSerializer,
    CapitalListSerializer, CapitalCreateSerializer,
)
from apps.finance.selectors import get_expenses, get_income, get_capital
from apps.finance.services import (
    create_expense, update_expense, approve_expense,
    create_income, update_income, approve_income,
    create_capital, approve_capital,
)
from apps.farms.selectors import user_has_farm_access
from apps.permissions.permissions import require_permission
from apps.common.responses import success_response, created_response
from apps.common.pagination import StandardResultsPagination


# ── Expenses ──────────────────────────────────────────────────────────────────

class ExpenseListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("expenses.create")()]
        return [require_permission("expenses.view")()]

    def get(self, request):
        filters = {
            "farm": request.query_params.get("farm"),
            "is_approved": request.query_params.get("is_approved"),
            "date_from": request.query_params.get("date_from"),
            "date_to": request.query_params.get("date_to"),
        }
        qs = get_expenses(request.user, filters)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(ExpenseListSerializer(page, many=True).data)

    def post(self, request):
        serializer = ExpenseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farm = serializer.validated_data["farm"]
        if not user_has_farm_access(request.user, farm.id):
            raise PermissionDenied("No access to this farm.")
        expense = create_expense(serializer.validated_data, performed_by=request.user)
        return created_response(data=ExpenseDetailSerializer(expense).data)


class ExpenseDetailView(APIView):

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [require_permission("expenses.update")()]
        return [require_permission("expenses.view")()]

    def _get(self, request, expense_id):
        expense = get_object_or_404(Expense, id=expense_id)
        if not user_has_farm_access(request.user, expense.farm_id):
            raise PermissionDenied("No access to this farm.")
        return expense

    def get(self, request, expense_id):
        return success_response(data=ExpenseDetailSerializer(self._get(request, expense_id)).data)

    def put(self, request, expense_id):
        expense = self._get(request, expense_id)
        serializer = ExpenseUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        expense = update_expense(expense, serializer.validated_data, performed_by=request.user)
        return success_response(data=ExpenseDetailSerializer(expense).data)


class ExpenseApproveView(APIView):
    permission_classes = [require_permission("expenses.approve")]

    def post(self, request, expense_id):
        expense = get_object_or_404(Expense, id=expense_id)
        if not user_has_farm_access(request.user, expense.farm_id):
            raise PermissionDenied("No access to this farm.")
        expense = approve_expense(expense, performed_by=request.user)
        return success_response(data=ExpenseDetailSerializer(expense).data, message="Expense approved.")


# ── Income ────────────────────────────────────────────────────────────────────

class IncomeListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("income.create")()]
        return [require_permission("income.view")()]

    def get(self, request):
        filters = {
            "farm": request.query_params.get("farm"),
            "is_approved": request.query_params.get("is_approved"),
            "date_from": request.query_params.get("date_from"),
            "date_to": request.query_params.get("date_to"),
        }
        qs = get_income(request.user, filters)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(IncomeListSerializer(page, many=True).data)

    def post(self, request):
        serializer = IncomeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farm = serializer.validated_data["farm"]
        if not user_has_farm_access(request.user, farm.id):
            raise PermissionDenied("No access to this farm.")
        income = create_income(serializer.validated_data, performed_by=request.user)
        return created_response(data=IncomeListSerializer(income).data)


class IncomeApproveView(APIView):
    permission_classes = [require_permission("income.approve")]

    def post(self, request, income_id):
        income = get_object_or_404(Income, id=income_id)
        if not user_has_farm_access(request.user, income.farm_id):
            raise PermissionDenied("No access to this farm.")
        income = approve_income(income, performed_by=request.user)
        return success_response(data=IncomeListSerializer(income).data, message="Income approved.")


# ── Capital ───────────────────────────────────────────────────────────────────

class CapitalListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("capital.create")()]
        return [require_permission("capital.view")()]

    def get(self, request):
        filters = {"farm": request.query_params.get("farm")}
        qs = get_capital(request.user, filters)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(CapitalListSerializer(page, many=True).data)

    def post(self, request):
        serializer = CapitalCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farm = serializer.validated_data["farm"]
        if not user_has_farm_access(request.user, farm.id):
            raise PermissionDenied("No access to this farm.")
        capital = create_capital(serializer.validated_data, performed_by=request.user)
        return created_response(data=CapitalListSerializer(capital).data)


class CapitalApproveView(APIView):
    permission_classes = [require_permission("capital.approve")]

    def post(self, request, capital_id):
        capital = get_object_or_404(Capital, id=capital_id)
        if not user_has_farm_access(request.user, capital.farm_id):
            raise PermissionDenied("No access to this farm.")
        capital = approve_capital(capital, performed_by=request.user)
        return success_response(data=CapitalListSerializer(capital).data, message="Capital approved.")
