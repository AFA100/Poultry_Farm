"""
Health check endpoint.
Used by Docker, load balancers, and monitoring systems.
No authentication required.
"""

import time

from django.core.cache import cache
from django.db import connection

from rest_framework import serializers, status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class HealthCheckSerializer(serializers.Serializer):
    status = serializers.CharField()
    checks = serializers.DictField()


class HealthCheckView(GenericAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = HealthCheckSerializer

    def get(self, request):
        checks = {}
        overall = "healthy"

        # Database check
        try:
            start = time.monotonic()
            connection.ensure_connection()

            checks["database"] = {
                "status": "ok",
                "latency_ms": round(
                    (time.monotonic() - start) * 1000,
                    2
                ),
            }

        except Exception as e:
            checks["database"] = {
                "status": "error",
                "detail": str(e),
            }
            overall = "degraded"

        # Redis check
        try:
            start = time.monotonic()

            cache.set("health_check_ping", "pong", 5)
            val = cache.get("health_check_ping")

            checks["redis"] = {
                "status": "ok" if val == "pong" else "error",
                "latency_ms": round(
                    (time.monotonic() - start) * 1000,
                    2
                ),
            }

        except Exception as e:
            checks["redis"] = {
                "status": "error",
                "detail": str(e),
            }
            overall = "degraded"

        http_status = (
            status.HTTP_200_OK
            if overall == "healthy"
            else status.HTTP_503_SERVICE_UNAVAILABLE
        )

        return Response(
            {
                "status": overall,
                "checks": checks,
            },
            status=http_status,
        )