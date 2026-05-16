from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from apps.users.models import User
from apps.users.api.serializers.user import UserListSerializer, UserCreateSerializer, UserDetailSerializer, UserUpdateSerializer
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


class UserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    def get_permissions(self):
        if self.request.method == "POST":
            return [require_permission("users.create")()]
        if self.request.method in ("PUT", "PATCH"):
            return [require_permission("users.update")()]
        if self.request.method == "DELETE":
            return [require_permission("users.delete")()]
        return [require_permission("users.view")()]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserDetailSerializer
