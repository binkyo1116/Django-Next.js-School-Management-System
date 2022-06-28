from __future__ import annotations
from typing import Any, TYPE_CHECKING

import datetime

from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.template.loader import render_to_string
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from utils.py import http_responses as r
from root.models import User as UserModel
from root.serializers import UserSerializer
from authentication.backend import PasswordResetTokenBackend

if TYPE_CHECKING:
    from rest_framework.request import Request


class PasswordResetViewSet(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)

        # Password reset token backend
        self.pwt_backend = PasswordResetTokenBackend()

    def get(self, request: Request, format=None) -> Response:
        username = request.query_params.get("username")
        token = request.query_params.get("token")

        if not username:
            return r.HTTP400Response("Missing 'username' parameter")
        if not token:
            return r.HTTP400Response("Missing 'token' parameter")

        validated = self.pwt_backend.validate(username, token)

        if validated is None:
            return r.HTTP400Response("Token expired or not found")
        elif validated is False:
            return r.HTTP400Response("Token does not match")
        else:  # validation successful
            self.pwt_backend.persist(username)
            return Response(
                {
                    "status": "success",
                    "status_code": status.HTTP_200_OK,
                },
                status=status.HTTP_200_OK,
            )

    def post(self, request: Request, format=None) -> Response:
        username = request.data.get("username")
        email_id = request.data.get("email_id")
        redirect_link = request.data.get("redirect_link")
        vars = request.data.get("vars", {})

        if not redirect_link:
            return r.HTTP400Response("Missing 'redirect_link'")

        try:
            if username:
                user: UserModel = UserModel.objects.get(username=username)
            elif email_id:
                user: UserModel = UserModel.objects.get(email_id=email_id)
            else:
                return r.HTTP400Response("Missing 'username' or 'email_id'")
        except UserModel.DoesNotExist:
            return r.HTTP404Response("No user found with the given credentials")

        token_data = self.pwt_backend.create(user)

        if isinstance(token_data, bool):
            return r.HTTP403Response("An unexpired token is already associated with the user")

        token, _, lifetime = token_data

        html_message = render_to_string(
            "resetpasswordemailtemplate.html",
            {
                "org_name": vars.get("org_name", ""),
                "expire_time": int(lifetime.total_seconds()),
                "copyright_year": datetime.datetime.now(),
                "privacy_policy": vars.get("privacy_policy", ""),
                "support_email": "support@example.com",
                "site_url": vars.get("site_url", ""),
                "redirect_link": f"{redirect_link}?username={user.username}&token={token}",
            },
        )
        plain_message = strip_tags(html_message)
        send_mail("Reset Password", plain_message, None, recipient_list=[user.email_id], html_message=html_message)

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_200_OK,
                "data": UserSerializer(user, context={"request": request}, fields={"username", "email"}),
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request: Request, format=None) -> Response:
        username = request.data.get("username")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not username:
            return r.HTTP400Response("Missing username")
        if not token:
            return r.HTTP400Response("Missing validation token")
        if not new_password:
            return r.HTTP400Response("Missing new password")

        try:
            user: UserModel = UserModel.objects.get(username=username)
        except UserModel.DoesNotExist:
            return r.HTTP404Response("No user found with the given username")

        validated = self.pwt_backend.validate(username=user.username, token=token)

        if validated is None:
            return r.HTTP400Response("Token expired or not found")
        elif validated is False:
            return r.HTTP400Response("Token does not match")
        else:  # validation successful
            self.pwt_backend.delete(
                user.username
            )  # delete the token since it's no longer needed (and shouldn't be used more than once)
            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return r.HTTP400Response(e.message)
            user.set_password(new_password)
            user.save()

            return Response(
                {
                    "status": "success",
                    "status_code": status.HTTP_200_OK,
                },
                status=status.HTTP_200_OK,
            )
