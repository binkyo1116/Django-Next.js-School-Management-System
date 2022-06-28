from __future__ import annotations

from django.db import models
from django.utils.translation import gettext_lazy as _

from .managers import SubjectManager


class Subject(models.Model):
    id = models.AutoField(verbose_name=_("ID"), auto_created=True, primary_key=True)
    name = models.CharField(verbose_name=_("Name"), max_length=64)
    code = models.PositiveSmallIntegerField(verbose_name=_("Subject code"))

    objects: SubjectManager = SubjectManager()

    class Meta:
        unique_together = ["name", "code"]

    def __eq__(self, __o: object) -> bool:
        return isinstance(__o, Subject) and self.id == __o.id

    def __ne__(self, __o: object) -> bool:
        if not isinstance(__o, Subject):
            return True
        return self.id != __o.id

    def __repr__(self) -> str:
        return f"<Subject name={self.name} code={self.code}>"

    def __str__(self) -> str:
        return self.name

    def __int__(self) -> int:
        return int(self.code)

    def get_teachers(self):
        return self.teacher_set.all()
