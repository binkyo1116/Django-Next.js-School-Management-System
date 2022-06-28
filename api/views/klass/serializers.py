from __future__ import annotations

from rest_framework import serializers

from .models import Class as ClassModel


class ClassSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs) -> None:
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    class Meta:
        model = ClassModel
        fields = [
            "id",
            "grade",
            "section",
        ]
