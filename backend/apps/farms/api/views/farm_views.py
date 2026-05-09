from rest_framework.views import APIView
from rest_framework.generics import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from apps.farms.models import Farm
from apps.farms.api.serializers import (
    FarmListSerializer, FarmDetailSerializer,
    FarmCreateSerializer, FarmUpdateSerializer,
)
from apps.farms.selectors import get_user_farms, user_has_farm_access
from apps.farms.services import create_farm, update_farm, archive_farm
from apps.permissions.permissions import require_permission
from apps.common.responses import success_response, created_response
from apps.common.pagination import StandardResultsPagination


class FarmListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("farms.create")()]
        return [require_permission("farms.view")()]

    def get(self, request):
        filters = {
            "province": request.query_params.get("province"),
            "is_active": request.query_params.get("is_active"),
        }
        qs = get_user_farms(request.user, filters)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(FarmListSerializer(page, many=True).data)

    def post(self, request):
        serializer = FarmCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farm = create_farm(serializer.validated_data, performed_by=request.user)
        return created_response(data=FarmDetailSerializer(farm).data)


class FarmDetailView(APIView):

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [require_permission("farms.update")()]
        if self.request.method == "DELETE":
            return [require_permission("farms.archive")()]
        return [require_permission("farms.view")()]

    def _get_farm(self, request, farm_id):
        farm = get_object_or_404(Farm, id=farm_id)
        if not user_has_farm_access(request.user, farm_id):
            raise PermissionDenied("You do not have access to this farm.")
        return farm

    def get(self, request, farm_id):
        farm = self._get_farm(request, farm_id)
        return success_response(data=FarmDetailSerializer(farm).data)

    def put(self, request, farm_id):
        farm = self._get_farm(request, farm_id)
        serializer = FarmUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        farm = update_farm(farm, serializer.validated_data, performed_by=request.user)
        return success_response(data=FarmDetailSerializer(farm).data)

    def delete(self, request, farm_id):
        farm = self._get_farm(request, farm_id)
        archive_farm(farm, performed_by=request.user)
        return success_response(message="Farm archived.")
