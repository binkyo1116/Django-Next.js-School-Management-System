from __future__ import annotations

from django.db import models
from django.utils.translation import gettext_lazy as _


class Contact(models.Model):
    id = models.BigAutoField(verbose_name=_("ID"), auto_created=True, primary_key=True, serialize=False)
    first_name = models.CharField(verbose_name=_("First Name"), max_length=255, help_text=_("First Name of the User"))
    last_name = models.CharField(
        verbose_name=_("Last Name"), max_length=255, null=True, blank=True, help_text=_("Last Name of the User")
    )
    email_id = models.EmailField(verbose_name=_("Email ID"), max_length=1023, help_text=_("Email ID of the User"))
    message = models.TextField(verbose_name=_("Message"), help_text=_("Message by the User"))

    def __eq__(self, __o: object) -> bool:
        return isinstance(__o, Contact) and self.id == __o.id

    def __ne__(self, __o: object) -> bool:
        if not isinstance(__o, Contact):
            return True
        return self.id != __o.id

    def __repr__(self) -> str:
        return f"<ContactMessage id={self.id} name={self.first_name + (' ' + self.last_name) if self.last_name else ''} email_id={self.email_id}>"

    def __str__(self) -> str:
        return self.message

    def __int__(self) -> int:
        return int(self.id)

    def get_full_name(self) -> str:
        return self.first_name + (" " + self.last_name) if self.last_name else ""

    def get_short_name(self) -> str:
        return self.first_name
