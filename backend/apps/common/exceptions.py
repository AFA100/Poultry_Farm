from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        return Response(
            {
                "success": False,
                "message": _extract_message(response.data),
                "errors": response.data,
            },
            status=response.status_code,
        )

    return Response(
        {
            "success": False,
            "message": "An unexpected error occurred.",
            "errors": {},
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _extract_message(data):
    if isinstance(data, dict):
        first = next(iter(data.values()), None)
        if isinstance(first, list) and first:
            return str(first[0])
        if isinstance(first, str):
            return first
    if isinstance(data, list) and data:
        return str(data[0])
    return "An error occurred."
