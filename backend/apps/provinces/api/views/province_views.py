from rest_framework.views import APIView
from rest_framework.generics import get_object_or_404

from apps.provinces.models import Province
from apps.provinces.api.serializers import (
    ProvinceListSerializer, ProvinceDetailSerializer, ProvinceCreateSerializer,
)
from apps.provinces.selectors import get_user_provinces, get_province_by_id
from apps.provinces.services import create_province, update_province, delete_province
from apps.permissions.permissions import require_permission
from apps.common.responses import success_response, created_response
from apps.common.pagination import StandardResultsPagination


class ProvinceListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("provinces.create")()]
        return [require_permission("provinces.view")()]

    def get(self, request):
        qs = get_user_provinces(request.user)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = ProvinceListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = ProvinceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        province = create_province(serializer.validated_data["name"], performed_by=request.user)
        return created_response(data=ProvinceDetailSerializer(province).data)


class ProvinceDetailView(APIView):

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [require_permission("provinces.update")()]
        if self.request.method == "DELETE":
            return [require_permission("provinces.delete")()]
        return [require_permission("provinces.view")()]

    def _get_province(self, province_id):
        return get_object_or_404(Province, id=province_id)

    def get(self, request, province_id):
        province = get_province_by_id(province_id)
        return success_response(data=ProvinceDetailSerializer(province).data)

    def put(self, request, province_id):
        province = self._get_province(province_id)
        serializer = ProvinceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        province = update_province(province, serializer.validated_data["name"], performed_by=request.user)
        return success_response(data=ProvinceDetailSerializer(province).data)

    def delete(self, request, province_id):
        province = self._get_province(province_id)
        delete_province(province, performed_by=request.user)
        return success_response(message="Province deleted.")
