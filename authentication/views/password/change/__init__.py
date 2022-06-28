from __future__ import annotations
from typing import TYPE_CHECKING

from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from utils.py import http_responses as r
from root.models import User as UserModel
from root.serializers import UserSerializer
from authentication.authentication import Authentication

if TYPE_CHECKING:
    from rest_framework.request import Request


class PasswordChangeViewSet(APIView):
    authentication_classes = [Authentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request: Request, format=None) -> Response:
        user: UserModel = request.user

        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        missing = ""
        if not current_password:
            missing += "Missing 'current_password'"
            if not new_password:
                missing += " and 'new_password' fields"
            else:
                missing += " field"
        elif not new_password:
            missing += "Missing 'new_password' field"

        if missing:
            return r.HTTP400Response(missing)

        if user.check_password(current_password) is False:
            return r.HTTP403Response("Incorrect Current Password")

        try:
            validate_password(new_password, user)
        except ValidationError:
            return r.HTTP400Response("New Password's validation failed")

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

        user.set_password(new_password)
        user.save()

        response = Response(
            {
                "status": "success",
                "status_code": status.HTTP_205_RESET_CONTENT,
                "data": UserSerializer(user, context={"request": request}, fields={"username", "email"}),
            },
            status=status.HTTP_205_RESET_CONTENT,
        )

        response.delete_cookie(settings.SIMPLE_JWT["AUTH_COOKIE"])
        response.delete_cookie(settings.SIMPLE_JWT["REFRESH_COOKIE"])
        response.delete_cookie(settings.CSRF_COOKIE_NAME)

        return response
