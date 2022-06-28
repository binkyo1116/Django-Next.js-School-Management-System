from __future__ import annotations
from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Contact as ContactModel
from .serializers import ContactSerializer
from utils.py import http_responses as r

if TYPE_CHECKING:
    from rest_framework.request import Request


class ContactViewSet(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request: Request, format=None) -> Response:
        data = request.data

        for key in {"first_name", "email_id", "message"}:
            if not data.get(key):
                return r.HTTP400Response(f"Missing {key!r} field")

        contact_message = ContactModel.objects.create(
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            email_id=data.get("email_id"),
            message=data.get("message"),
        )

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_201_CREATED,
                "data": ContactSerializer(contact_message).data,
            },
            status=status.HTTP_201_CREATED,
        )
