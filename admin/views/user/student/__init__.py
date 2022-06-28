from __future__ import annotations
from typing import TYPE_CHECKING

from django.core.exceptions import ValidationError

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from admin.permissions import IsStaff
from utils.py import http_responses as r
from root.serializers import StudentSerializer
from root.models import User as UserModel, Parent as ParentModel
from utils.py.exceptions import AlreadyExists, MissingRequiredFields

if TYPE_CHECKING:
    from rest_framework.request import Request

    from root.models import Student as StudentModel


class StudentViewSet(APIView):
    permission_classes = [IsStaff]

    def post(self, request: Request, format=None) -> Response:
        FIELDS = [
            "username",
            "first_name",
            "last_name",
            "email_id",
            "avatar",
            "date_of_birth",
            "gender",
            "contact_no",
            "address",
            "password",
            # Student-only fields
            "parent",
            "grade",
            "roll_no",
            "year_of_enroll",
            "fee",
        ]
        data = {"user_type": "s"}

        for key in FIELDS:
            data[key] = request.data.get(key)

        if data["parent"] and isinstance(data["parent"], str):
            try:
                data["parent"] = ParentModel.objects.get(parent__username=data["parent"])["parent"]
            except ParentModel.DoesNotExist:
                return r.HTTP404Response("No parent account found with the given parent username")

        try:
            student: StudentModel = UserModel.objects.create(**data)
            return Response(
                {
                    "status": "success",
                    "status_code": status.HTTP_201_CREATED,
                    "data": StudentSerializer(student, context={"request": request}).data,
                },
                status=status.HTTP_201_CREATED,
            )
        except MissingRequiredFields as e:
            return r.HTTP400Response(f"Missing required fields: {', '.join(f for f in e.missing_fields)}")
        except ValidationError as e:
            return r.HTTP400Response(e.message)
        except AlreadyExists as e:
            return r.HTTP400Response(f"User already exists with given {','.join(f for f in e.colliding_fields)}")
