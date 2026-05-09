from django.urls import path
from apps.employees.api.views import EmployeeListCreateView, EmployeeDetailView

urlpatterns = [
    path("", EmployeeListCreateView.as_view(), name="employee-list-create"),
    path("<uuid:employee_id>/", EmployeeDetailView.as_view(), name="employee-detail"),
]
