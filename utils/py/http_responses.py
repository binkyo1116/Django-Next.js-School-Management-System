from rest_framework import status as s
from rest_framework.response import Response


def HTTP400Response(message: str = None) -> Response:
    return Response(
        {
            "status": "error",
            "status_code": s.HTTP_400_BAD_REQUEST,
            "error": {
                "error_type": "Bad Request",
                "error_message": message or "Invalid data passed",
            },
        },
        status=s.HTTP_400_BAD_REQUEST,
    )


def HTTP401Response(message: str = None) -> Response:
    return Response(
        {
            "status": "error",
            "status_code": s.HTTP_401_UNAUTHORIZED,
            "error": {
                "error_type": "Unauthorized",
                "error_message": message or "Unauthorized",
            },
        },
        status=s.HTTP_401_UNAUTHORIZED,
    )


def HTTP403Response(message: str = None) -> Response:
    return Response(
        {
            "status": "error",
            "status_code": s.HTTP_403_FORBIDDEN,
            "error": {
                "error_type": "Forbidden",
                "error_message": message or "No Access",
            },
        },
        status=s.HTTP_403_FORBIDDEN,
    )


def HTTP404Response(message: str = None) -> Response:
    return Response(
        {
            "status": "error",
            "status_code": s.HTTP_404_NOT_FOUND,
            "error": {
                "error_type": "NotFound",
                "error_message": message or "Requested data not found",
            },
        },
        status=s.HTTP_404_NOT_FOUND,
    )


def HTTP500Response(message: str = None) -> Response:
    return Response(
        {
            "status": "error",
            "status_code": s.HTTP_500_INTERNAL_SERVER_ERROR,
            "error": {
                "error_type": "InternalServerError",
                "error_message": message or "Some Error Occured. Please try again later",
            },
        },
        status=s.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def HTTP502Response(message: str = None) -> Response:
    return Response(
        {
            "status": "error",
            "status_code": s.HTTP_502_BAD_GATEWAY,
            "error": {
                "error_type": "BadGateway",
                "error_message": message or "Some error occured while preparing response. Please try again later",
            },
        },
        status=s.HTTP_502_BAD_GATEWAY,
    )
