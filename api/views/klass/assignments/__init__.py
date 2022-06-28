from __future__ import annotations
from typing import TYPE_CHECKING

from dateutil.parser import parse as dateparser

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from utils.py import http_responses as r
from ..models import Class as ClassModel
from api.views.assignment.serializers import AssignmentSerializer

if TYPE_CHECKING:
    from rest_framework.request import Request


class ClassAssignmentsViewSet(APIView):
    def get(self, request: Request, format=None) -> Response:
        id = request.query_params.get("id")
        grade = request.query_params.get("grade")
        section = request.query_params.get("section")

        date = request.query_params.get("date")
        if date:
            date = dateparser(date).date()
        newest_first = request.query_params.get("newest-first")

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

        if date:
            assignments = klass.get_assignments_by_date(date)
        else:
            assignments = klass.get_assignments()

        if newest_first and newest_first.lower() == "true":
            assignments = assignments.order_by("-assigned_at")

        data = [AssignmentSerializer(assignment, context={"request": request}).data for assignment in assignments]

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_200_OK,
                "data": data,
            },
            status=status.HTTP_200_OK,
        )
