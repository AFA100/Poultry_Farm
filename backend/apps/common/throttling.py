"""
Custom throttle classes for rate limiting.
Auth endpoints are rate-limited to prevent brute force.
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """5 login attempts per minute per IP."""
    scope = "login"


class AuthUserRateThrottle(UserRateThrottle):
    """100 requests per minute for authenticated users."""
    scope = "auth_user"


class BurstRateThrottle(UserRateThrottle):
    """60 requests per minute burst limit."""
    scope = "burst"


class SustainedRateThrottle(UserRateThrottle):
    """1000 requests per day sustained limit."""
    scope = "sustained"
