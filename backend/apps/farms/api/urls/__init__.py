from django.urls import path
from apps.farms.api.views import FarmListCreateView, FarmDetailView

urlpatterns = [
    path("", FarmListCreateView.as_view(), name="farm-list-create"),
    path("<uuid:farm_id>/", FarmDetailView.as_view(), name="farm-detail"),
]
