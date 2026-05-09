from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from apps.authentication.api.serializers.login import LoginSerializer, ChangePasswordSerializer
from apps.authentication.services import login_user, logout_user, change_password
from apps.common.responses import success_response, error_response
from apps.common.throttling import LoginRateThrottle
from apps.users.api.serializers.user import UserDetailSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = login_user(**serializer.validated_data)
        return success_response(data=data, message="Login successful.")


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return error_response("Refresh token is required.")
        logout_user(refresh_token)
        return success_response(message="Logged out successfully.")


class RefreshView(APIView):
    """Thin wrapper — SimpleJWT handles this; kept for URL consistency."""
    permission_classes = [AllowAny]

    def post(self, request):
        from rest_framework_simplejwt.views import TokenRefreshView
        return TokenRefreshView.as_view()(request._request)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return success_response(data=serializer.data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_password(request.user, **serializer.validated_data)
        return success_response(message="Password changed successfully.")
