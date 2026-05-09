from django.urls import path
from apps.permissions.api.views import (
    RoleListCreateView, RoleDetailView,
    PermissionListView, PermissionGroupListView,
    UserRolesView, UserDirectPermissionsView,
)

urlpatterns = [
    path("roles/", RoleListCreateView.as_view(), name="role-list-create"),
    path("roles/<uuid:id>/", RoleDetailView.as_view(), name="role-detail"),
    path("permissions/", PermissionListView.as_view(), name="permission-list"),
    path("permission-groups/", PermissionGroupListView.as_view(), name="permission-group-list"),
    path("users/<uuid:user_id>/roles/", UserRolesView.as_view(), name="user-roles"),
    path("users/<uuid:user_id>/permissions/", UserDirectPermissionsView.as_view(), name="user-direct-permissions"),
]
