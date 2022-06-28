from __future__ import annotations
from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from root.models import (
    Student as StudentModel,
    Teacher as TeacherModel,
    Parent as ParentModel,
    Management as ManagementModel,
)
from root.serializers import (
    UserSerializer,
    StudentSerializer,
    TeacherSerializer,
    ParentSerializer,
    ManagementSerializer,
)

if TYPE_CHECKING:
    from rest_framework.request import Request

    from root.models import User as UserModel


class MeViewSet(APIView):
    def get(self, request: Request, format=None) -> Response:
        user: UserModel = request.user

        with_type = request.query_params.get("with-type")
        if with_type and with_type.lower() == "true":
            if user.user_type == "s":
                student = StudentModel.objects.get(student=user)
                data = StudentSerializer(student, context={"request": request}).data
            elif user.user_type == "t":
                teacher = TeacherModel.objects.get(teacher=user)
                data = TeacherSerializer(teacher, context={"request": request}).data
            elif user.user_type == "p":
                parent = ParentModel.objects.get(parent=user)
                data = ParentSerializer(parent, context={"request": request}).data
            elif user.user_type == "m":
                management = ManagementModel.objects.get(management=user)
                data = ManagementSerializer(management, context={"request": request}).data
            elif user.user_type == "a":
                data = {"admin": UserSerializer(user, context={"request": request}).data}
        else:
            data = UserSerializer(user, context={"request": request}).data

        return Response(
            {
                "status": "success",
                "status_code": status.HTTP_200_OK,
                "data": data,
            },
            status=status.HTTP_200_OK,
        )
