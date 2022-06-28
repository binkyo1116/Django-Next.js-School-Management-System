from __future__ import annotations
from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from api.permissions import IsTeacherForPOSTElseIsAuthenticated
from utils.py import http_responses as r
from .serializers import AssignmentSerializer
from .models import Assignment as AssignmentModel

if TYPE_CHECKING:
    from rest_framework.request import Request


class AssignmentViewSet(APIView):
    permission_classes = [IsTeacherForPOSTElseIsAuthenticated]

    def get(self, request: Request, format=None) -> Response:
        id = request.query_params.get("id")

        if id:
            try:
                assignment = AssignmentModel.objects.get(id=id)
                return Response(
                    {
                        "status": "success",
                        "status_code": status.HTTP_200_OK,
                        "data": AssignmentSerializer(assignment, context={"request": request}).data,
                    },
                    status=status.HTTP_200_OK,
                )
            except AssignmentModel.DoesNotExist:
                return r.HTTP404Response("No assignment found with the given id")

    def post(self, request: Request, format=None) -> Response:
        data = request.data

        for key in {"title", "assigned_by", "assigned_to", "file"}:
            if not data.get(key):
                return r.HTTP400Response(f"Missing {key!r} field")

        assignment = AssignmentModel.objects.create(
            title=data.get("title"),
            assigned_by=data.get("assigned_by"),
            assigned_to=data.get("assigned_to"),
            submission_date=data.get("submission_date"),
            file=data.get("file"),
            message=data.get("message"),
        )

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_201_CREATED,
                "data": AssignmentSerializer(assignment, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )
