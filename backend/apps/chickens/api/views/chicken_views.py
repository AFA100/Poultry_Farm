from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied

from apps.chickens.api.serializers import (
    ChickenBatchListSerializer, ChickenBatchCreateSerializer,
    ChickenMovementListSerializer, ChickenMovementCreateSerializer,
)
from apps.chickens.selectors import get_batches, get_movements
from apps.chickens.services import create_batch, create_movement
from apps.farms.selectors import user_has_farm_access
from apps.permissions.permissions import require_permission
from apps.common.responses import success_response, created_response
from apps.common.pagination import StandardResultsPagination


class ChickenBatchListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("chickens.create")()]
        return [require_permission("chickens.view")()]

    def get(self, request):
        filters = {"farm": request.query_params.get("farm"), "status": request.query_params.get("status")}
        qs = get_batches(request.user, filters)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(ChickenBatchListSerializer(page, many=True).data)

    def post(self, request):
        serializer = ChickenBatchCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farm = serializer.validated_data["farm"]
        if not user_has_farm_access(request.user, farm.id):
            raise PermissionDenied("No access to this farm.")
        batch = create_batch(serializer.validated_data, performed_by=request.user)
        return created_response(data=ChickenBatchListSerializer(batch).data)


class ChickenMovementListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("chickens.create")()]
        return [require_permission("chickens.view")()]

    def get(self, request):
        filters = {
            "farm": request.query_params.get("farm"),
            "type": request.query_params.get("type"),
            "batch": request.query_params.get("batch"),
        }
        qs = get_movements(request.user, filters)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(ChickenMovementListSerializer(page, many=True).data)

    def post(self, request):
        serializer = ChickenMovementCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farm = serializer.validated_data["farm"]
        if not user_has_farm_access(request.user, farm.id):
            raise PermissionDenied("No access to this farm.")
        movement = create_movement(serializer.validated_data, performed_by=request.user)
        return created_response(data=ChickenMovementListSerializer(movement).data)
