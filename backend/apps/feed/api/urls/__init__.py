from django.urls import path
from apps.feed.api.views import FeedInventoryListView, FeedTransactionListCreateView, FeedTransactionDetailView

urlpatterns = [
    path("feed-inventory/", FeedInventoryListView.as_view(), name="feed-inventory-list"),
    path("feed-transactions/", FeedTransactionListCreateView.as_view(), name="feed-transaction-list-create"),
    path("feed-transactions/<uuid:transaction_id>/", FeedTransactionDetailView.as_view(), name="feed-transaction-detail"),
]
