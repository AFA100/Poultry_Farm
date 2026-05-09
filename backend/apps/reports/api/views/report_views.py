from rest_framework.views import APIView
from apps.reports.selectors import (
    get_profit_loss_report,
    get_chicken_movement_report,
    get_mortality_report,
    get_feed_consumption_report,
)
from apps.permissions.permissions import require_permission
from apps.common.responses import success_response


def _date_filters(request) -> dict:
    return {
        "date_from": request.query_params.get("date_from"),
        "date_to": request.query_params.get("date_to"),
        "farm_id": request.query_params.get("farm"),
        "province_id": request.query_params.get("province"),
    }


class ProfitLossReportView(APIView):
    permission_classes = [require_permission("reports.view")]

    def get(self, request):
        data = get_profit_loss_report(request.user, **_date_filters(request))
        return success_response(data=data)


class ChickenMovementReportView(APIView):
    permission_classes = [require_permission("reports.view")]

    def get(self, request):
        filters = _date_filters(request)
        filters.pop("province_id", None)
        data = get_chicken_movement_report(request.user, **filters)
        return success_response(data=data)


class MortalityReportView(APIView):
    permission_classes = [require_permission("reports.view")]

    def get(self, request):
        filters = _date_filters(request)
        filters.pop("province_id", None)
        data = get_mortality_report(request.user, **filters)
        return success_response(data=data)


class FeedConsumptionReportView(APIView):
    permission_classes = [require_permission("reports.view")]

    def get(self, request):
        filters = _date_filters(request)
        filters.pop("province_id", None)
        data = get_feed_consumption_report(request.user, **filters)
        return success_response(data=data)
