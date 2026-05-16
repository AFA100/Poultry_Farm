from django.urls import path
from apps.finance.api.views import (
    ExpenseListCreateView, ExpenseDetailView, ExpenseApproveView,
    IncomeListCreateView, IncomeApproveView, IncomeDetailView,
    CapitalListCreateView, CapitalApproveView, CapitalDetailView,
)

urlpatterns = [
    path("expenses/", ExpenseListCreateView.as_view(), name="expense-list-create"),
    path("expenses/<uuid:expense_id>/", ExpenseDetailView.as_view(), name="expense-detail"),
    path("expenses/<uuid:expense_id>/approve/", ExpenseApproveView.as_view(), name="expense-approve"),

    path("income/", IncomeListCreateView.as_view(), name="income-list-create"),
    path("income/<uuid:income_id>/", IncomeDetailView.as_view(), name="income-detail"),
    path("income/<uuid:income_id>/approve/", IncomeApproveView.as_view(), name="income-approve"),

    path("capital/", CapitalListCreateView.as_view(), name="capital-list-create"),
    path("capital/<uuid:capital_id>/", CapitalDetailView.as_view(), name="capital-detail"),
    path("capital/<uuid:capital_id>/approve/", CapitalApproveView.as_view(), name="capital-approve"),
]
