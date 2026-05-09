from django.urls import path
from apps.feed.api.views import FeedInventoryListView, FeedTransactionListCreateView

urlpatterns = [
    path("feed-inventory/", FeedInventoryListView.as_view(), name="feed-inventory-list"),
    path("feed-transactions/", FeedTransactionListCreateView.as_view(), name="feed-transaction-list-create"),
]
