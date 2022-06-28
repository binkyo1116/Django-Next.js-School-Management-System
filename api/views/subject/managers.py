from __future__ import annotations
from typing import Any, TYPE_CHECKING

from django.db import models

from utils.py.exceptions import AlreadyExists, MissingRequiredFields

if TYPE_CHECKING:
    from .models import Subject as SubjectModel


class SubjectManager(models.Manager):
    REQUIRED_FIELDS = ["name", "code"]

    def create(
        self,
        *,
        name: str,
        code: int,
        **extra_fields: Any,
    ) -> SubjectModel:
        FIELDS = {
            "name": name,
            "code": code,
        }

        missing_fields = []
        for required_field in self.REQUIRED_FIELDS:
            if not FIELDS.get(required_field):
                missing_fields.append(required_field)
        if missing_fields:
            raise MissingRequiredFields(missing_fields=missing_fields)

        _existing_subjects = self.filter(**FIELDS)
        if _existing_subjects:
            raise AlreadyExists()

        subject: SubjectModel = self.model(**FIELDS, **extra_fields)
        subject.save()

        return subject
