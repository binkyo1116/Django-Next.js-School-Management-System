from __future__ import annotations
from typing import TYPE_CHECKING

from django.core.exceptions import ValidationError

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from admin.permissions import IsAdmin
from utils.py import http_responses as r
from root.models import User as UserModel
from root.serializers import UserSerializer
from utils.py.exceptions import AlreadyExists, MissingRequiredFields

if TYPE_CHECKING:
    from rest_framework.request import Request


class UserViewSet(APIView):
    permission_classes = [IsAdmin]

    def post(self, request: Request, format=None) -> Response:
        FIELDS = [
            "username",
            "first_name",
            "last_name",
            "email_id",
            "avatar",
            "user_type",
            "date_of_birth",
            "gender",
            "contact_no",
            "address",
            "password",
        ]
        data = {}

        for key in FIELDS:
            data[key] = request.data.get(key)

        try:
            user: UserModel = UserModel.objects.create_user(**data)
            return Response(
                {
                    "status": "success",
                    "status_code": status.HTTP_201_CREATED,
                    "data": UserSerializer(user, context={"request": request}).data,
                },
                status=status.HTTP_201_CREATED,
            )
        except MissingRequiredFields as e:
            return r.HTTP400Response(f"Missing required fields: {', '.join(f for f in e.missing_fields)}")
        except ValidationError as e:
            return r.HTTP400Response(e.message)
        except AlreadyExists as e:
            return r.HTTP400Response(f"User already exists with given {','.join(f for f in e.colliding_fields)}")
