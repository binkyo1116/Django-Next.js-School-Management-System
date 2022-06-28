from __future__ import annotations

from rest_framework import serializers

from .models import Subject as SubjectModel


class SubjectSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs) -> None:
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    class Meta:
        model = SubjectModel
        fields = [
            "id",
            "name",
            "code",
        ]
