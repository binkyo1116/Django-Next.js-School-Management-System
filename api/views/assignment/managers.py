from __future__ import annotations
from typing import Any, List, Union, Optional, TYPE_CHECKING

from datetime import datetime, date
from dateutil.parser import parse as dateparser

from django.db import models
from django.core.files import File
from django.forms import ValidationError

from utils.py.utils import DataURI
from root.models import FileAssets as FileAssetsModel

if TYPE_CHECKING:
    from ..klass.models import Class as ClassModel
    from .models import Assignment as AssignmentModel
    from root.models import Teacher as TeacherModel


class AssignmentManager(models.Manager):
    def create(
        self,
        *,
        title: str,
        assigned_by: Union[int, TeacherModel],
        assigned_to: List[Union[int, ClassModel]],
        submission_date: Optional[Union[str, date]] = None,
        file: Union[int, str, DataURI, FileAssetsModel],
        message: Optional[str] = None,
        nosave: Optional[bool] = False,
        **extra_fields: Any,
    ) -> AssignmentModel:
        FIELDS = {
            "title": title,
            "assigned_by": assigned_by,
            "submission_date": submission_date,
            "file": file,
            "message": message,
        }

        if isinstance(FIELDS["assigned_by"], int):
            FIELDS["assigned_by_id"] = FIELDS.pop("assigned_by")
        if isinstance(FIELDS["submission_date"], str):
            FIELDS["submission_date"] = dateparser(FIELDS["submission_date"]).date()
        if isinstance(FIELDS["file"], int):
            FIELDS["file_id"] = FIELDS.pop("file")
        elif not isinstance(FIELDS["file"], FileAssetsModel):
            uri = DataURI(FIELDS["file"])

            extension = uri.extension
            if not extension:
                raise ValidationError(f"Cannot determine the extension for mimetype: {uri.mimetype!r}")

            _file = File(
                file=uri.stream,
                name=(
                    "assignment"
                    f"_{FIELDS.get('assigned_by').teacher.id if FIELDS.get('assigned_by') is not None else FIELDS.get('assigned_by_id')}"
                    f"_{datetime.now().strftime('%Y%m%d%H%M%S')}"
                    f"{extension}"
                ),
            )
            asset = FileAssetsModel.objects.create(file=_file)
            FIELDS["file"] = asset

        assignment: AssignmentModel = self.model(**FIELDS, **extra_fields)
        if not nosave:
            assignment.save()
            assignment.assigned_to.add(*assigned_to)

        return assignment
