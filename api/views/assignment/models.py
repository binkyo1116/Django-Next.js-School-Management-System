from __future__ import annotations

from django.db import models
from django.utils.translation import gettext_lazy as _

from .managers import AssignmentManager


class Assignment(models.Model):
    id = models.AutoField(verbose_name=_("ID"), auto_created=True, primary_key=True)
    title = models.CharField(verbose_name=_("Title"), max_length=1000)
    assigned_at = models.DateTimeField(verbose_name=_("Assigned at"), auto_created=True, auto_now_add=True)
    assigned_by = models.ForeignKey(to="root.Teacher", on_delete=models.CASCADE, related_name="assignment_set")
    assigned_to = models.ManyToManyField(to="Class", related_name="assignment_set")
    submission_date = models.DateField(verbose_name=_("Submission Date"), blank=True, null=True)
    file = models.ForeignKey(to="root.FileAssets", on_delete=models.CASCADE)
    message = models.CharField(verbose_name=_("Message"), max_length=1000, blank=True, null=True)

    objects: AssignmentManager = AssignmentManager()

    def __eq__(self, __o: object) -> bool:
        return isinstance(__o, Assignment) and self.id == __o.id

    def __ne__(self, __o: object) -> bool:
        if not isinstance(__o, Assignment):
            return True
        return self.id != __o.id

    def __repr__(self) -> str:
        return f"<Assignment id={self.id} title={self.title} assigned_by={self.assigned_by!r}>"

    def __str__(self) -> str:
        return self.title

    def __int__(self) -> int:
        return int(self.id)
