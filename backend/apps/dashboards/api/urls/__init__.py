from django.urls import path
from apps.dashboards.api.views import GlobalDashboardView, ProvinceDashboardView, FarmDashboardView

urlpatterns = [
    path("dashboard/", GlobalDashboardView.as_view(), name="global-dashboard"),
    path("dashboard/province/<uuid:province_id>/", ProvinceDashboardView.as_view(), name="province-dashboard"),
    path("dashboard/farm/<uuid:farm_id>/", FarmDashboardView.as_view(), name="farm-dashboard"),
]
