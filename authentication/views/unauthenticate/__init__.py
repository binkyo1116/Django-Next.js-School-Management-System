from __future__ import annotations
from typing import TYPE_CHECKING

from django.conf import settings

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from utils.py import http_responses as r

if TYPE_CHECKING:
    from rest_framework.request import Request


class UnAuthViewSet(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request: Request, format=None) -> Response:
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["REFRESH_COOKIE"])
        if not refresh_token:
            refresh_token = request.data.get("refresh_token")

        if not refresh_token:
            return r.HTTP400Response("Missing 'refresh_token'")

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            pass

        response = Response(status=status.HTTP_205_RESET_CONTENT)

        response.delete_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )
        response.delete_cookie(
            key=settings.SIMPLE_JWT["REFRESH_COOKIE"],
            path=settings.SIMPLE_JWT["REFRESH_COOKIE_PATH"],
            samesite=settings.SIMPLE_JWT["REFRESH_COOKIE_SAMESITE"],
        )
        response.delete_cookie(
            key=settings.CSRF_COOKIE_NAME,
            path=settings.CSRF_COOKIE_PATH,
            samesite=settings.CSRF_COOKIE_SAMESITE,
        )

        return response
