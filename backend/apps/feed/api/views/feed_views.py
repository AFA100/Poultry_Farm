from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied

from apps.feed.api.serializers import (
    FeedInventorySerializer, FeedTransactionListSerializer, FeedTransactionCreateSerializer,
)
from apps.feed.selectors import get_feed_inventory, get_feed_transactions
from apps.feed.services import create_feed_transaction
from apps.farms.selectors import user_has_farm_access
from apps.permissions.permissions import require_permission
from apps.common.responses import success_response, created_response
from apps.common.pagination import StandardResultsPagination


class FeedInventoryListView(APIView):
    permission_classes = [require_permission("feed.view")]

    def get(self, request):
        farm_id = request.query_params.get("farm")
        qs = get_feed_inventory(request.user, farm_id)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(FeedInventorySerializer(page, many=True).data)


class FeedTransactionListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("feed.create")()]
        return [require_permission("feed.view")()]

    def get(self, request):
        filters = {"farm": request.query_params.get("farm"), "type": request.query_params.get("type")}
        qs = get_feed_transactions(request.user, filters)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(FeedTransactionListSerializer(page, many=True).data)

    def post(self, request):
        serializer = FeedTransactionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farm = serializer.validated_data["farm"]
        if not user_has_farm_access(request.user, farm.id):
            raise PermissionDenied("No access to this farm.")
        tx = create_feed_transaction(serializer.validated_data, performed_by=request.user)
        return created_response(data=FeedTransactionListSerializer(tx).data)
