from __future__ import annotations
from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from ..serializers import SubjectSerializer
from ..models import Subject as SubjectModel

if TYPE_CHECKING:
    from django.db.models import QuerySet

    from rest_framework.request import Request


class SubjectAllViewSet(APIView):
    def get(self, request: Request, format=None) -> Response:
        subjects: QuerySet = SubjectModel.objects.all().order_by("name", "code")

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_200_OK,
                "data": [SubjectSerializer(subject).data for subject in subjects],
            },
            status=status.HTTP_200_OK,
        )
