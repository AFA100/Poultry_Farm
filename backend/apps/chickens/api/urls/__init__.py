from django.urls import path
from apps.chickens.api.views import ChickenBatchListCreateView, ChickenMovementListCreateView

urlpatterns = [
    path("chicken-batches/", ChickenBatchListCreateView.as_view(), name="chicken-batch-list-create"),
    path("chicken-movements/", ChickenMovementListCreateView.as_view(), name="chicken-movement-list-create"),
]
