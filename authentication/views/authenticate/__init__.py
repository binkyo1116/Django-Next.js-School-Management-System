from __future__ import annotations
from typing import TypedDict, TYPE_CHECKING

from django.conf import settings
from django.middleware import csrf
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import AUTH_HEADER_TYPES
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from utils.py import http_responses as r
from root.serializers import UserSerializer
from authentication.authentication import CSRFExemptAuthentication

if TYPE_CHECKING:
    from rest_framework.request import Request
    from root.models import User as UserModel


class TokenDict(TypedDict):
    refresh: str
    access: str


def get_tokens_for_user(user: UserModel) -> TokenDict:
    refresh = RefreshToken.for_user(user)
    return TokenDict(refresh=str(refresh), access=str(refresh.access_token))


class AuthViewSet(APIView):
    authentication_classes = [CSRFExemptAuthentication]
    permission_classes = [AllowAny]

    def get(self, request: Request, format=None) -> Response:
        if request.user.is_authenticated:
            outstanding_token = OutstandingToken.objects.filter(user=request.user).order_by("-created_at")[0]
            refresh = RefreshToken(outstanding_token.token)

            # `RefreshToken.access_token` generates a new token instead of getting the old one
            # For returning original token, we need to fetch it from Header or Cookie
            def get_access_token():
                header = request.META.get(settings.SIMPLE_JWT["AUTH_HEADER_NAME"])

                if header:
                    access = header.split()[1]
                else:
                    cookie = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"])
                    access = cookie.split()[1]

                return access

            access = get_access_token()

            return Response(
                {
                    "status": "success",
                    "status_code": status.HTTP_200_OK,
                    "data": {
                        **(
                            UserSerializer(
                                request.user,
                                context={"request": request},
                                fields={"id", "username", "first_name", "last_name", "email_id", "avatar", "user_type"},
                            ).data
                        ),
                        "access_token": f"{AUTH_HEADER_TYPES[0]} {str(access)}",
                        "refresh_token": str(refresh),
                    },
                },
                status=status.HTTP_200_OK,
            )
        else:
            return r.HTTP401Response()

    def post(self, request: Request, format=None) -> Response:
        if TYPE_CHECKING:
            user: UserModel

        username = request.data.get("username")
        email_id = request.data.get("email_id")
        password = request.data.get("password")

        if not password:
            return r.HTTP400Response("Missing 'password'")

        if username:
            user = authenticate(username=username, password=password)
        elif email_id:
            user = authenticate(email_id=email_id, password=password)
        else:
            return r.HTTP400Response("Missing 'username' or 'email_id'")

        if not user:
            return r.HTTP404Response("No user found with the given credentials")

        data = get_tokens_for_user(user)

        _response = Response()

        csrf.get_token(request)

        _response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=f"{AUTH_HEADER_TYPES[0]} {data['access']}",
            max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )
        _response.set_cookie(
            key=settings.SIMPLE_JWT["REFRESH_COOKIE"],
            value=data["refresh"],
            max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
            path=settings.SIMPLE_JWT["REFRESH_COOKIE_PATH"],
            secure=settings.SIMPLE_JWT["REFRESH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["REFRESH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["REFRESH_COOKIE_SAMESITE"],
        )

        _response.data = {
            "status": "success",
            "status_code": status.HTTP_200_OK,
            "data": {
                **(
                    UserSerializer(
                        user,
                        context={"request": request},
                        fields={"id", "username", "first_name", "last_name", "email_id", "avatar", "user_type"},
                    ).data
                ),
                "access_token": f"{AUTH_HEADER_TYPES[0]} {data['access']}",
                "refresh_token": data["refresh"],
            },
        }
        _response.status_code = status.HTTP_200_OK

        update_last_login(None, user)

        return _response
