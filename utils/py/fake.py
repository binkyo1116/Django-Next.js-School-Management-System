from __future__ import annotations
from typing import Any

from django.core.exceptions import FieldDoesNotExist


class FakeUserForValidation:
    PARAMS = ["username", "first_name", "last_name", "email_id"]

    def __init__(self, *_: Any, **kwargs: Any) -> None:
        for param in self.PARAMS:
            if value := kwargs.get(param):
                setattr(self, param, value)

        self._meta = self.Meta(self)

    class Meta:
        class _FakeField:
            def __init__(self, value: str) -> None:
                self.verbose_name = value

        def __init__(self, fake_class: FakeUserForValidation) -> None:
            self.__fake_owner = fake_class

        def get_field(self, field_name: str) -> _FakeField:
            if getattr(self.__fake_owner, field_name):
                return self._FakeField(field_name)

            raise FieldDoesNotExist()
