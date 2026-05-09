from django.urls import path
from apps.reports.api.views import (
    ProfitLossReportView, ChickenMovementReportView,
    MortalityReportView, FeedConsumptionReportView,
)

urlpatterns = [
    path("profit-loss/", ProfitLossReportView.as_view(), name="report-profit-loss"),
    path("chicken-movements/", ChickenMovementReportView.as_view(), name="report-chicken-movements"),
    path("mortality/", MortalityReportView.as_view(), name="report-mortality"),
    path("feed-consumption/", FeedConsumptionReportView.as_view(), name="report-feed-consumption"),
]
