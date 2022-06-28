from __future__ import annotations
from typing import List, Optional

from django.utils.translation import gettext_lazy as _


class AuthenticationException(Exception):
    """Base class for all authentication related exceptions."""

    pass


class AuthenticationBackendError(AuthenticationException):
    """Base class for all exceptions raised by Authentication Backend."""

    pass


class InvalidAuthenticationArguments(AuthenticationBackendError):
    def __init__(
        self, message: str = "Cannot pass two or more particular fields together", fields: Optional[List[str]] = None
    ) -> None:
        self.fields = fields

        if fields:
            message += f"\nFields: {', '.join(f for f in fields)}"

        super().__init__(_(message))


class ModelException(Exception):
    """Base class for all models related exceptions."""

    pass


class ModelValidationError(ModelException):
    """Base class for validation of model while creating objects."""

    pass


class MissingRequiredFields(ModelValidationError):
    """Raised when a required field is missing while creating model instance."""

    def __init__(self, message: str = "Missing required fields", missing_fields: Optional[List[str]] = None) -> None:
        self.missing_fields = missing_fields

        if missing_fields:
            message += f"\nMissing Fields: {', '.join(f for f in missing_fields)}"

        super().__init__(_(message))


class AlreadyExists(ModelValidationError):
    """Raised when a field with same details already exists."""

    def __init__(
        self, message: str = "Object with same fields already exists", colliding_fields: Optional[List[str]] = None
    ) -> None:
        self.colliding_fields = colliding_fields

        if colliding_fields:
            message += f"\Colliding Fields: {', '.join(f for f in colliding_fields)}"

        super().__init__(_(message))
