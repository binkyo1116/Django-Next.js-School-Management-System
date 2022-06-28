from __future__ import annotations
from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from ..models import Class as ClassModel
from ..serializers import ClassSerializer

if TYPE_CHECKING:
    from django.db.models import QuerySet

    from rest_framework.request import Request


class ClassAllViewSet(APIView):
    def get(self, request: Request, format=None) -> Response:
        classes: QuerySet = ClassModel.objects.all().order_by("grade", "section")

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_200_OK,
                "data": [ClassSerializer(klass).data for klass in classes],
            },
            status=status.HTTP_200_OK,
        )
