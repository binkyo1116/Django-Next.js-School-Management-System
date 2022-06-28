from __future__ import annotations
from typing import TYPE_CHECKING

from django.conf import settings
from django.test.client import RequestFactory

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import token_refresh
from rest_framework_simplejwt.authentication import AUTH_HEADER_TYPES

from utils.py import http_responses as r

if TYPE_CHECKING:
    from rest_framework.request import Request


class TokenRefreshViewSet(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request: Request, format=None) -> Response:
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["REFRESH_COOKIE"])
        if not refresh_token:
            refresh_token = request.data.get("refresh_token")

        if not refresh_token:
            return r.HTTP400Response("Missing 'refresh_token'")

        # rest_framework_simplejwt's token_refresh view takes the refresh token and returns a refreshed access_token
        # We'll make a fake request to the view which includes our fetched refresh token
        _fakefactory = RequestFactory()
        _fakerequest = _fakefactory.post("/", data={"refresh": refresh_token}, content_type="application/json")
        _fakeresponse = token_refresh(_fakerequest)

        if _fakeresponse.status_code == 200:
            response = Response(
                {
                    "status": "success",
                    "status_code": status.HTTP_201_CREATED,
                    "data": {
                        "access_token": f"{AUTH_HEADER_TYPES[0]} {_fakeresponse.data['access']}",
                    },
                },
                status=status.HTTP_201_CREATED,
            )
            response.set_cookie(
                key=settings.SIMPLE_JWT["AUTH_COOKIE"],
                value=f"{AUTH_HEADER_TYPES[0]} {_fakeresponse.data['access']}",
                max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
                path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
                secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            )
            return response
        elif _fakeresponse.status_code == 401:
            return r.HTTP401Response("Refresh token is invalid or expired")
        else:
            return r.HTTP500Response()
