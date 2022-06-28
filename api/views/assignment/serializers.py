from rest_framework import serializers

from .models import Assignment as AssignmentModel
from root.serializers import ClassSerializer, FileAssetsSerializer, TeacherSerializer


class AssignmentSerializer(serializers.ModelSerializer):
    assigned_by = TeacherSerializer()
    assigned_to = ClassSerializer(many=True)
    file = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs) -> None:
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

        for field in {"assigned_by"}:
            self.fields[field].context.update(self.context)

    def get_file(self, obj: AssignmentModel) -> str:
        data = FileAssetsSerializer(
            instance=obj.file, fields={"file"}, context={"request": self.context["request"]}
        ).data
        return data.get("file")

    class Meta:
        model = AssignmentModel
        fields = [
            "id",
            "title",
            "assigned_at",
            "assigned_by",
            "assigned_to",
            "submission_date",
            "file",
            "message",
        ]
