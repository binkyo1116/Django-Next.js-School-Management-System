from __future__ import annotations
from typing import TYPE_CHECKING

import urllib.parse

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from utils.py import http_responses as r
from root.models import User as UserModel
from root.serializers import UserSerializer

if TYPE_CHECKING:
    from rest_framework.request import Request


class UserViewSet(APIView):
    def get(self, request: Request, format=None) -> Response:
        username = request.query_params.get("username")
        email_id = request.query_params.get("email_id")
        id = request.query_params.get("id")

        try:
            if username:
                username = urllib.parse.unquote(username)
                user: UserModel = UserModel.objects.get(username=username)
            elif email_id:
                email_id = urllib.parse.unquote(email_id)
                user: UserModel = UserModel.objects.get(email_id=email_id)
            elif id:
                user: UserModel = UserModel.objects.get(id=id)
            else:
                return r.HTTP400Response("Missing 'username', 'email_id' or 'id' parameter")
        except UserModel.DoesNotExist:
            return r.HTTP404Response("No user found with the given credentials")

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_200_OK,
                "data": UserSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )
