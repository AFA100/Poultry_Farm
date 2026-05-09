"""
Root URL configuration.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Health check (no auth)
    path("api/", include("apps.common.api.urls")),

    # API v1
    path("api/v1/auth/", include("apps.authentication.api.urls")),
    path("api/v1/users/", include("apps.users.api.urls")),
    path("api/v1/", include("apps.permissions.api.urls")),
    path("api/v1/provinces/", include("apps.provinces.api.urls")),
    path("api/v1/farms/", include("apps.farms.api.urls")),
    path("api/v1/employees/", include("apps.employees.api.urls")),
    path("api/v1/", include("apps.chickens.api.urls")),
    path("api/v1/", include("apps.feed.api.urls")),
    path("api/v1/", include("apps.finance.api.urls")),
    path("api/v1/", include("apps.dashboards.api.urls")),
    path("api/v1/reports/", include("apps.reports.api.urls")),
    path("api/v1/", include("apps.audit_logs.api.urls")),

    # Schema / Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
