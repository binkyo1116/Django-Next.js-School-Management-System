from __future__ import annotations
from typing import Any, Optional, TYPE_CHECKING

from django.db import models

from utils.py.exceptions import AlreadyExists, MissingRequiredFields

if TYPE_CHECKING:
    from .models import Class as ClassModel


class ClassManager(models.Manager):
    REQUIRED_FIELDS = ["grade"]

    def create(
        self,
        *,
        grade: str,
        section: Optional[str] = None,
        **extra_fields: Any,
    ) -> ClassModel:
        FIELDS = {
            "grade": grade,
            "section": section,
        }

        missing_fields = []
        for required_field in self.REQUIRED_FIELDS:
            if not FIELDS.get(required_field):
                missing_fields.append(required_field)
        if missing_fields:
            raise MissingRequiredFields(missing_fields=missing_fields)

        _existing_classes = self.filter(**FIELDS)
        if _existing_classes:
            raise AlreadyExists()

        klass: ClassModel = self.model(**FIELDS, **extra_fields)
        klass.save()

        return klass
