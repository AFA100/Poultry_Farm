from django.urls import path
from apps.chickens.api.views import (
    ChickenBatchListCreateView, ChickenMovementListCreateView,
    ChickenBatchDetailView, ChickenMovementDetailView,
)

urlpatterns = [
    path("chicken-batches/", ChickenBatchListCreateView.as_view(), name="chicken-batch-list-create"),
    path("chicken-movements/", ChickenMovementListCreateView.as_view(), name="chicken-movement-list-create"),
    path("chicken-batches/<uuid:batch_id>/", ChickenBatchDetailView.as_view(), name="chicken-batch-detail"),
    path("chicken-movements/<uuid:movement_id>/", ChickenMovementDetailView.as_view(), name="chicken-movement-detail"),
]
