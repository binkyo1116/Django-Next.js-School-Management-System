from __future__ import annotations
from typing import Any, Optional

import os
import io
import re
import sys
import json
import time
import random
import string
import datetime
import textwrap
import itertools
import mimetypes
import threading
from base64 import b64encode, b64decode
from urllib.parse import quote, unquote

from django.core.exceptions import ValidationError


def get_asset_directory_path(_, filename: str) -> str:
    VALID_PATHS = ["assignment", "avatar"]
    for path in VALID_PATHS:
        if filename.startswith(path):
            return (
                f"{path}/"
                f"{datetime.date.today().strftime('%Y/%m')}/"
                f"{''.join([random.choice(string.ascii_letters + string.digits) for _ in range(10)])}_{filename}"
            )
    return (
        "untitled/"
        f"{datetime.date.today().strftime('%Y/%m')}/"
        f"{''.join([random.choice(string.ascii_letters + string.digits) for _ in range(10)])}_{filename}"
    )


MIMETYPE_REGEX = r"[\w]+\/[\w\-\+\.]+"
CHARSET_REGEX = r"[\w\-\+\.]+"
DATA_URI_REGEX = (
    r"data:"
    + r"(?P<mimetype>{})?".format(MIMETYPE_REGEX)
    + r"(?:\;name\=(?P<name>[\w\.\-%!*'~\(\)]+))?"
    + r"(?:\;charset\=(?P<charset>{}))?".format(CHARSET_REGEX)
    + r"(?P<base64>\;base64)?"
    + r",(?P<data>.*)"
)

_MIMETYPE_RE = re.compile("^{}$".format(MIMETYPE_REGEX))
_CHARSET_RE = re.compile("^{}$".format(CHARSET_REGEX))
_DATA_URI_RE = re.compile(r"^{}$".format(DATA_URI_REGEX), re.DOTALL)

with open(f"{os.path.dirname(os.path.realpath(__file__))}/_mimetype_to_extension.json", "r") as f:
    _mimetype_to_extension: dict = json.load(f)


class DataURI(str):
    @classmethod
    def make(
        cls, *, mimetype: Optional[str] = None, charset: Optional[str] = None, base64: Optional[bool] = True, data: Any
    ) -> DataURI:
        parts = ["data:"]
        if mimetype is not None:
            if not _MIMETYPE_RE.match(mimetype):
                raise ValidationError("Invalid mimetype: %r" % mimetype)
            parts.append(mimetype)
        if charset is not None:
            if not _CHARSET_RE.match(charset):
                raise ValidationError("Invalid charset: %r" % charset)
            parts.extend([";charset=", charset])
        if base64:
            parts.append(";base64")
            _charset = charset or "utf-8"
            if isinstance(data, bytes):
                _data = data
            else:
                _data = bytes(data, _charset)
            encoded_data = b64encode(_data).decode(_charset).strip()
        else:
            encoded_data = quote(data)
        parts.extend([",", encoded_data])
        return cls("".join(parts))

    @classmethod
    def from_file(cls, filename: str, charset: Optional[str] = None, base64: Optional[bool] = True) -> DataURI:
        mimetype, _ = mimetypes.guess_type(filename, strict=False)
        with open(filename, "rb") as fp:
            data = fp.read()

        return cls.make(mimetype=mimetype, charset=charset, base64=base64, data=data)

    def __new__(cls, *args: Any, **kwargs: Any) -> DataURI:
        uri = super(DataURI, cls).__new__(cls, *args, **kwargs)
        uri._parse  # Trigger any ValueErrors on instantiation.
        return uri

    def __repr__(self) -> str:
        return "DataURI(%s)" % (super(DataURI, self).__repr__(),)

    def wrap(self, width=76) -> str:
        return "\n".join(textwrap.wrap(self, width, break_on_hyphens=False))

    @property
    def mimetype(self) -> Optional[str]:
        return self._parse[0]

    @property
    def name(self) -> Optional[str]:
        name = self._parse[1]
        if name is not None:
            return unquote(name)
        return name

    @property
    def charset(self) -> Optional[str]:
        return self._parse[2]

    @property
    def is_base64(self) -> bool:
        return self._parse[3]

    @property
    def data(self) -> str:
        return self._parse[4]

    @property
    def text(self) -> str:
        if self.charset is None:
            raise AttributeError("DataURI has no encoding set.")

        return self.data.decode(self.charset)

    @property
    def stream(self) -> io.BytesIO:
        return io.BytesIO(self.data)

    @property
    def extension(self) -> Optional[str]:
        if mt := self.mimetype:
            return _mimetype_to_extension.get(mt)
        return None

    @property
    def _parse(self):
        match = _DATA_URI_RE.match(self)
        if not match:
            raise ValidationError("Not a valid data URI: %r" % self)
        mimetype = match.group("mimetype") or None
        name = match.group("name") or None
        charset = match.group("charset") or None

        if match.group("base64"):
            _charset = charset or "utf-8"
            _data = bytes(match.group("data"), _charset)
            data = b64decode(_data)
        else:
            data = unquote(match.group("data"))

        return mimetype, name, charset, bool(match.group("base64")), data


class SpinnerMessage:
    spinner_cycle = itertools.cycle(["-", "/", "|", "\\"])

    def __init__(
        self, initial_message: str, finish_message: Optional[str] = None, stdout: Optional[io.TextIOBase] = sys.stdout
    ) -> None:
        self.initial_message = initial_message + " "
        self.finish_message = finish_message
        self.stdout = stdout

        self.spin_thread = threading.Thread(target=self.init_spin)
        self.stop_running = threading.Event()

    def __enter__(self) -> None:
        self.start()

    def __exit__(self, exc_type, exc_value, exc_tb) -> Optional[bool]:
        self.stop()
        if exc_type is not None:
            return False

    def start(self) -> None:
        self.spin_thread.start()

    def stop(self) -> None:
        self.stop_running.set()
        self.spin_thread.join()

    def init_spin(self) -> None:
        while not self.stop_running.is_set():
            self.stdout.write(self.initial_message + next(self.spinner_cycle) + "\r")
            self.stdout.flush()
            time.sleep(0.25)

        if self.finish_message:
            self.stdout.write(self.finish_message + " " * (len(self.initial_message) + 1 - len(self.finish_message)))
        else:
            self.stdout.write(" " * (len(self.initial_message) + 1) + "\r")
