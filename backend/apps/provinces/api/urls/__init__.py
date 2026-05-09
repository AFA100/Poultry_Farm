from django.urls import path
from apps.provinces.api.views import ProvinceListCreateView, ProvinceDetailView

urlpatterns = [
    path("", ProvinceListCreateView.as_view(), name="province-list-create"),
    path("<uuid:province_id>/", ProvinceDetailView.as_view(), name="province-detail"),
]
