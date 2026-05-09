from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied

from apps.dashboards.selectors import get_global_dashboard, get_province_dashboard, get_farm_dashboard
from apps.farms.selectors import user_has_farm_access
from apps.provinces.models import Province
from apps.farms.models import Farm
from rest_framework.generics import get_object_or_404
from apps.permissions.permissions import require_permission
from apps.common.responses import success_response


class GlobalDashboardView(APIView):
    permission_classes = [require_permission("dashboard.view")]

    def get(self, request):
        data = get_global_dashboard(request.user)
        return success_response(data=data)


class ProvinceDashboardView(APIView):
    permission_classes = [require_permission("dashboard.view")]

    def get(self, request, province_id):
        get_object_or_404(Province, id=province_id)
        data = get_province_dashboard(province_id)
        return success_response(data=data)


class FarmDashboardView(APIView):
    permission_classes = [require_permission("dashboard.view")]

    def get(self, request, farm_id):
        get_object_or_404(Farm, id=farm_id)
        if not user_has_farm_access(request.user, farm_id):
            raise PermissionDenied("No access to this farm.")
        data = get_farm_dashboard(farm_id)
        return success_response(data=data)
