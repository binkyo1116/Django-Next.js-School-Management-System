from __future__ import annotations
from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from utils.py import http_responses as r
from .serializers import SubjectSerializer
from .models import Subject as SubjectModel
from utils.py.exceptions import AlreadyExists
from api.permissions import IsStaffForPOSTElseIsAuthenticated

if TYPE_CHECKING:
    from rest_framework.request import Request


class SubjectViewSet(APIView):
    permission_classes = [IsStaffForPOSTElseIsAuthenticated]

    def get(self, request: Request, format=None) -> Response:
        id = request.query_params.get("id")
        name = request.query_params.get("name")
        code = request.query_params.get("code")

        try:
            if id:
                subject: SubjectModel = SubjectModel.objects.get(id=id)
            else:
                if name and code:
                    subject: SubjectModel = SubjectModel.objects.get(name=name, code=code)
                else:
                    return r.HTTP400Response("Missing 'id', or 'name' and 'code' parameters")
        except SubjectModel.DoesNotExist:
            return r.HTTP404Response("No subject found with the given data")

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_200_OK,
                "data": SubjectSerializer(subject).data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request: Request, format=None) -> Response:
        name = request.data.get("name")
        code = request.data.get("code")

        if not name or not code:
            return r.HTTP400Response("Missing 'name' or 'code' parameter")

        try:
            code = int(code)
        except ValueError:
            return r.HTTP400Response("'code' must be an integer")

        try:
            subject = SubjectModel.objects.create(name=name, code=code)
        except AlreadyExists:
            return r.HTTP400Response("Subject already exists with the given parameters")

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_201_CREATED,
                "data": SubjectSerializer(subject).data,
            },
            status=status.HTTP_201_CREATED,
        )
