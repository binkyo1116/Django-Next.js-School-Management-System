from __future__ import annotations
from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Class as ClassModel
from .serializers import ClassSerializer
from utils.py import http_responses as r
from utils.py.exceptions import AlreadyExists
from api.permissions import IsStaffForPOSTElseIsAuthenticated


if TYPE_CHECKING:
    from rest_framework.request import Request


class ClassViewSet(APIView):
    permission_classes = [IsStaffForPOSTElseIsAuthenticated]

    def get(self, request: Request, format=None) -> Response:
        id = request.query_params.get("id")
        grade = request.query_params.get("grade")
        section = request.query_params.get("section")

        try:
            if id:
                klass: ClassModel = ClassModel.objects.get(id=id)
            else:
                if grade and section:
                    klass: ClassModel = ClassModel.objects.get(grade=grade, section=section)
                else:
                    return r.HTTP400Response("Missing 'id', or 'grade' and 'section' parameters")
        except ClassModel.DoesNotExist:
            return r.HTTP404Response("No class found with the given data")

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_200_OK,
                "data": ClassSerializer(klass).data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request: Request, format=None) -> Response:
        grade = request.data.get("grade")
        section = request.data.get("section")

        if not grade:
            return r.HTTP400Response("Missing 'grade' parameter")

        try:
            klass = ClassModel.objects.create(grade=grade, section=section)
        except AlreadyExists:
            return r.HTTP400Response("Class already exists with the given parameters")

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_201_CREATED,
                "data": ClassSerializer(klass).data,
            },
            status=status.HTTP_201_CREATED,
        )
