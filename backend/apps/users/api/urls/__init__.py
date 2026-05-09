from django.urls import path
from apps.users.api.views.user_views import UserListCreateView, UserDetailView

urlpatterns = [
    path("", UserListCreateView.as_view(), name="user-list-create"),
    path("<uuid:id>/", UserDetailView.as_view(), name="user-detail"),
]
