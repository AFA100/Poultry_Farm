"""
Authentication service — handles login, logout, token operations.
"""
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed, ValidationError


def login_user(email: str, password: str) -> dict:
    """Validates credentials and returns JWT token pair."""
    user = authenticate(username=email, password=password)
    if not user:
        raise AuthenticationFailed("Invalid email or password.")
    if not user.is_active:
        raise AuthenticationFailed("Account is inactive.")

    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
        },
    }


def logout_user(refresh_token: str):
    """Blacklists the refresh token."""
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except Exception:
        raise ValidationError("Invalid or expired refresh token.")


def change_password(user, old_password: str, new_password: str):
    """Changes user password after verifying old password."""
    if not user.check_password(old_password):
        raise ValidationError("Old password is incorrect.")
    user.set_password(new_password)
    user.save(update_fields=["password"])
