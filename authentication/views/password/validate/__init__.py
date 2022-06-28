from __future__ import annotations
from typing import TYPE_CHECKING

from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from utils.py import http_responses as r, fake
from root.models import User as UserModel

if TYPE_CHECKING:
    from rest_framework.request import Request


class PasswordValidationViewSet(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request: Request, format=None) -> Response:
        password = request.data.get("password")
        if not password:
            return r.HTTP400Response("Missing 'password' parameter")

        user = None

        username = request.data.get("username")
        if username:
            try:
                user = UserModel.objects.get(username=username)
            except UserModel.DoesNotExist:
                pass

        if not user:
            FIELDS = {
                k: v
                for k, v in {
                    "username": username,
                    "email_id": request.data.get("email_id"),
                    "first_name": request.data.get("first_name"),
                    "last_name": request.data.get("last_name"),
                }.items()
                if v is not None
            }
            user = fake.FakeUserForValidation(**FIELDS)

        try:
            validate_password(password, user)
            return Response(
                {
                    "status": "success",
                    "status_code": status.HTTP_200_OK,
                },
                status=status.HTTP_200_OK,
            )
        except ValidationError as e:
            errors = []
            for error in e:
                errors.append(str(error))

            return Response(
                {
                    "status": "error",
                    "status_code": status.HTTP_400_BAD_REQUEST,
                    "error": {
                        "error_type": "Bad Request",
                        "error_message": "Validation Failed",
                        "errors": errors,
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
