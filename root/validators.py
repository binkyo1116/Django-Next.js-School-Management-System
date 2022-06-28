from __future__ import annotations
from typing import Any, Dict, Optional, TYPE_CHECKING

import string

from django.core.exceptions import ValidationError

if TYPE_CHECKING:
    from .models import User as UserModel


class RequiredPasswordCharactersValidator:
    def __init__(
        self,
        required_chars: Optional[Dict[str, Dict[str, Any]]] = {
            "ascii_lowercase": {"minimum_length": 1},
            "ascii_uppercase": {"minimum_length": 1},
            "digits": {"minimum_length": 1},
            "punctuation": {"minimum_length": 1},
        },
    ):
        VALID_KEYS = {"ascii_lowercase", "ascii_uppercase", "digits", "punctuation"}
        if not set(required_chars.keys()).issubset(VALID_KEYS):
            raise ValueError("Invalid key in required_chars")

        for key, value in required_chars.items():
            setattr(self, f"__{key}", value)

    def validate(self, password: str, user: Optional[UserModel] = None):
        if __ascii_lowercase := getattr(self, "__ascii_lowercase", None):
            _list = list(filter((-1).__ne__, [password.find(letter) for letter in string.ascii_lowercase]))
            if min_length := __ascii_lowercase.get("minimum_length"):
                if len(_list) < min_length:
                    raise ValidationError(
                        f"Password must contain atleast {min_length} ascii lowercase chatacter{'s' if min_length > 1 else ''}"
                    )

        if __ascii_uppercase := getattr(self, "__ascii_uppercase", None):
            _list = list(filter((-1).__ne__, [password.find(letter) for letter in string.ascii_uppercase]))
            if min_length := __ascii_uppercase.get("minimum_length"):
                if len(_list) < min_length:
                    raise ValidationError(
                        f"Password must contain atleast {min_length} ascii uppercase chatacter{'s' if min_length > 1 else ''}"
                    )

        if __digits := getattr(self, "__digits", None):
            _list = list(filter((-1).__ne__, [password.find(str(digit)) for digit in string.digits]))
            if min_length := __digits.get("minimum_length"):
                if len(_list) < min_length:
                    raise ValidationError(
                        f"Password must contain atleast {min_length} digit{'s' if min_length > 1 else ''}"
                    )

        if __punctuation := getattr(self, "__punctuation", None):
            _list = list(filter((-1).__ne__, [password.find(str(letter)) for letter in string.punctuation]))
            if min_length := __punctuation.get("minimum_length"):
                if len(_list) < min_length:
                    raise ValidationError(
                        f"Password must contain atleast {min_length} punctuation{'s' if min_length > 1 else ''}"
                    )

        return None  # validation passed

    def get_help_text(self):
        text = ""

        if any(
            [
                getattr(self, "__ascii_lowercase", None),
                getattr(self, "__ascii_uppercase", None),
                getattr(self, "__digits", None),
                getattr(self, "__punctuation", None),
            ]
        ):
            text += "Your password must contain "

        if x := getattr(self, "__ascii_lowercase", None):
            if min_length := x.get("minimum_length"):
                text += f"atleast {min_length} ascii lowercase character{'s' if min_length > 1 else ''}"
            text += "ascii lowercase characters"

        if x := getattr(self, "__ascii_uppercase", None):
            if min_length := x.get("minimum_length"):
                text += f", {min_length} ascii uppercase character{'s' if min_length > 1 else ''}"
            text += ", ascii uppercase characters"

        if x := getattr(self, "__digits", None):
            if min_length := x.get("minimum_length"):
                text += f", {min_length} digits{'s' if min_length > 1 else ''}"
            text += ", digits"

        if x := getattr(self, "__punctuation", None):
            if min_length := x.get("minimum_length"):
                text += f", {min_length} punctuations{'s' if min_length > 1 else ''}"
            text += ", punctuations"

        return text
