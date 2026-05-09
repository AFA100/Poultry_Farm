from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from apps.users.models import User
from apps.users.api.serializers.user import UserListSerializer, UserCreateSerializer, UserDetailSerializer
from apps.permissions.permissions import require_permission


class UserListCreateView(ListCreateAPIView):
    queryset = User.objects.all().order_by("-created_at")
    permission_classes = [require_permission("users.view")]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("users.create")()]
        return [require_permission("users.view")()]


class UserDetailView(RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [require_permission("users.view")]
    lookup_field = "id"
