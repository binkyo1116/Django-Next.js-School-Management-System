from __future__ import annotations
from typing import TYPE_CHECKING

from rest_framework import serializers

from .models import (
    FileAssets as FileAssetsModel,
    ImageAssets as ImageAssetsModel,
    Management as ManagementModel,
    Parent as ParentModel,
    Student as StudentModel,
    Teacher as TeacherModel,
    User as UserModel,
)
from api.views.subject.serializers import SubjectSerializer
from api.views.klass.serializers import ClassSerializer

if TYPE_CHECKING:
    from rest_framework.request import Request


class FileAssetsSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs) -> None:
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def get_file(self, obj: FileAssetsModel) -> str:
        request: Request = self.context["request"]
        return request.build_absolute_uri(obj.file.url)

    class Meta:
        model = FileAssetsModel
        fields = ["id", "file", "uploaded_at"]


class ImageAssetsSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs) -> None:
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def get_image(self, obj: ImageAssetsModel) -> str:
        request: Request = self.context["request"]
        return request.build_absolute_uri(obj.image.url)

    class Meta:
        model = ImageAssetsModel
        fields = ["id", "image", "uploaded_at"]


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField(allow_null=True)

    def __init__(self, *args, **kwargs) -> None:
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def get_avatar(self, obj: UserModel) -> str:
        data = ImageAssetsSerializer(
            instance=obj.avatar, fields={"image"}, context={"request": self.context["request"]}
        ).data
        return data.get("image")

    class Meta:
        model = UserModel
        fields = [
            "id",
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
            "date_joined",
        ]


class ParentSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs) -> None:
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

        for field in {"parent"}:
            self.fields[field].context.update(self.context)

    parent = UserSerializer()

    class Meta:
        model = ParentModel
        fields = [
            "parent",
        ]


class StudentSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs) -> None:
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

        for field in {"student", "parent", "grade"}:
            self.fields[field].context.update(self.context)

    student = UserSerializer()
    parent = ParentSerializer(allow_null=True)
    grade = ClassSerializer(allow_null=True)

    class Meta:
        model = StudentModel
        fields = [
            "student",
            "parent",
            "grade",
            "roll_no",
            "year_of_enroll",
            "fee",
        ]


class TeacherSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs) -> None:
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

        for field in {"teacher", "subject", "classes", "owns_class"}:
            self.fields[field].context.update(self.context)

    teacher = UserSerializer()
    subject = SubjectSerializer(allow_null=True)
    classes = ClassSerializer(many=True, allow_null=True)
    owns_class = ClassSerializer(allow_null=True)

    class Meta:
        model = TeacherModel
        fields = [
            "teacher",
            "subject",
            "year_of_joining",
            "salary",
            "classes",
            "owns_class",
        ]


class ManagementSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs) -> None:
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

        for field in {"management"}:
            self.fields[field].context.update(self.context)

    management = UserSerializer()

    class Meta:
        model = ManagementModel
        fields = [
            "management",
            "role",
            "year_of_joining",
            "salary",
        ]
