from rest_framework.views import APIView
from rest_framework.generics import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from apps.chickens.api.serializers import (
    ChickenBatchListSerializer, ChickenBatchCreateSerializer, ChickenBatchUpdateSerializer,
    ChickenMovementListSerializer, ChickenMovementCreateSerializer, ChickenMovementUpdateSerializer,
)
from apps.chickens.models import ChickenBatch, ChickenMovement
from apps.chickens.models import ChickenBatch, ChickenMovement
from apps.chickens.selectors import get_batches, get_movements
from apps.chickens.services import (
    create_batch, create_movement,
    update_batch, delete_batch,
    update_movement, delete_movement,
)
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


class ChickenBatchDetailView(APIView):

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [require_permission("chickens.update")()]
        if self.request.method == "DELETE":
            return [require_permission("chickens.delete")()]
        return [require_permission("chickens.view")()]

    def _get_batch(self, request, batch_id):
        batch = get_object_or_404(ChickenBatch, id=batch_id)
        if not user_has_farm_access(request.user, batch.farm_id):
            raise PermissionDenied("No access to this farm.")
        return batch

    def get(self, request, batch_id):
        batch = self._get_batch(request, batch_id)
        return success_response(data=ChickenBatchListSerializer(batch).data)

    def put(self, request, batch_id):
        batch = self._get_batch(request, batch_id)
        serializer = ChickenBatchUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        batch = update_batch(batch, serializer.validated_data, performed_by=request.user)
        return success_response(data=ChickenBatchListSerializer(batch).data)

    def delete(self, request, batch_id):
        batch = self._get_batch(request, batch_id)
        delete_batch(batch, performed_by=request.user)
        return success_response(message="Chicken batch deleted.", data={})


class ChickenMovementDetailView(APIView):

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [require_permission("chickens.update")()]
        if self.request.method == "DELETE":
            return [require_permission("chickens.delete")()]
        return [require_permission("chickens.view")()]

    def _get_movement(self, request, movement_id):
        movement = get_object_or_404(ChickenMovement, id=movement_id)
        if not user_has_farm_access(request.user, movement.farm_id):
            raise PermissionDenied("No access to this farm.")
        return movement

    def get(self, request, movement_id):
        movement = self._get_movement(request, movement_id)
        return success_response(data=ChickenMovementListSerializer(movement).data)

    def put(self, request, movement_id):
        movement = self._get_movement(request, movement_id)
        serializer = ChickenMovementUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        movement = update_movement(movement, serializer.validated_data, performed_by=request.user)
        return success_response(data=ChickenMovementListSerializer(movement).data)

    def delete(self, request, movement_id):
        movement = self._get_movement(request, movement_id)
        delete_movement(movement, performed_by=request.user)
        return success_response(message="Chicken movement deleted.", data={})
