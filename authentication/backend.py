from __future__ import annotations
from typing import Optional, Tuple, Union, overload, TYPE_CHECKING

import pytz
from uuid import uuid4
from datetime import datetime, timedelta

from django.conf import settings
from django.contrib.auth.backends import ModelBackend
from django.utils.translation import gettext_lazy as _

from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.utils import datetime_to_epoch
from rest_framework_simplejwt.exceptions import TokenBackendError
from rest_framework_simplejwt.settings import api_settings as simplejwt_api_settings

from core.redis import redis_client
from root.models import User as UserModel
from utils.py.exceptions import InvalidAuthenticationArguments

if TYPE_CHECKING:
    from django.http.request import HttpRequest


class AuthenticationBackend(ModelBackend):
    @overload
    def authenticate(self, request: HttpRequest = ..., username: str = ..., password: str = ...) -> Optional[UserModel]:
        ...

    @overload
    def authenticate(self, request: HttpRequest = ..., email_id: str = ..., password: str = ...) -> Optional[UserModel]:
        ...

    def authenticate(
        self, __r: HttpRequest = None, username: str = None, password: str = None, email_id: str = None
    ) -> Optional[UserModel]:
        if not password:
            raise InvalidAuthenticationArguments("Missing 'password' argument", fields=["password"])

        if username and email_id:
            raise InvalidAuthenticationArguments(
                _("Cannot pass both username and email_id in authenticate()"), fields=["username", "email_id"]
            )

        if username:
            __kwargs = {"username": username}
        elif email_id:
            __kwargs = {"email_id": email_id}
        else:
            raise InvalidAuthenticationArguments(
                _("Missing 'username' or 'email_id' arguments"), fields=["username", "email_id"]
            )

        try:
            user = UserModel.objects.get(**__kwargs)
        except UserModel.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user (#20760).
            UserModel().set_password(password)
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user

    def get_user(self, user_id: int) -> Optional[UserModel]:
        try:
            user = UserModel.objects.get(id=user_id)
        except UserModel.DoesNotExist:
            return None

        return user if self.user_can_authenticate(user) else None


class PasswordResetTokenBackend:
    """A Backend which handles generation, destruction and validation of the temporary password reset tokens.

    Lifetime of the token can be set using the django setting `PASSWORD_RESET_TIMEOUT` (https://docs.djangoproject.com/en/3.2/ref/settings/#password-reset-timeout)
    """

    def __init__(self) -> None:
        self.backend = TokenBackend(
            simplejwt_api_settings.ALGORITHM,
            simplejwt_api_settings.SIGNING_KEY,
            simplejwt_api_settings.VERIFYING_KEY,
            simplejwt_api_settings.AUDIENCE,
            simplejwt_api_settings.ISSUER,
            simplejwt_api_settings.JWK_URL,
            simplejwt_api_settings.LEEWAY,
        )

    def encode(self, user: UserModel) -> Tuple[str, datetime, timedelta]:
        """Encodes the payload to a token using simplejwt TokenBackend.

        Returns:
            (Tuple[(1) str, (2) datetime, (3) timedelta]) data:
                (1) str: Value of the token generated
                (2) datetime: A `datetime.datetime` object representing generation time of the token
                (3) timedelta: A `datetime.timedelta` object representing lifetime of the token
        """

        lifetime = timedelta(seconds=settings.PASSWORD_RESET_TIMEOUT)
        generation_time = datetime.now(tz=pytz.timezone(settings.TIME_ZONE))

        token = self.backend.encode(
            {
                "user": str(user.id) + "|" + user.username + "|" + user.email_id,
                simplejwt_api_settings.TOKEN_TYPE_CLAIM: "password_reset",
                "exp": datetime_to_epoch(generation_time + lifetime),
                "iat": datetime_to_epoch(generation_time),
                simplejwt_api_settings.JTI_CLAIM: uuid4().hex,
            }
        )
        return (token, generation_time, lifetime)

    def decode(self, token) -> Optional[dict]:
        """Decodes the token to the payload using simplejwt TokenBackend.

        Returns:
            (dict) payload: The payload associated with the token
            (NoneType) None: Token is invalid or expired
        """

        try:
            return self.backend.decode(token)
        except TokenBackendError as e:
            if e.args[0] == _("Token is invalid or expired"):
                return None
            else:
                raise e

    def create(self, user: UserModel) -> Union[bool, Tuple[str, datetime, timedelta]]:
        """Creates a token for the given user and saves it in cache.

        Returns:
            (Tuple[(1) str, (2) datetime, (3) timedelta]) data:
                (1) str: Value of the token generated
                (2) datetime: A `datetime.datetime` object representing generation time of the token
                (3) timedelta: A `datetime.timedelta` object representing lifetime of the token
            (bool) False: An unexpired token is already associated with the given user
        """

        token, generation_time, lifetime = self.encode(user)
        key = f"django_passwordresettokenbackend_{user.username}"

        response = redis_client.set(key, token, ex=lifetime, nx=True)

        if response is None:
            return False

        return (token, generation_time, lifetime)

    def get(self, username: str) -> Optional[str]:
        """Searches for the token associated with the username and returns it.

        Returns:
            (str) token: value of the token
            (NoneType) None: Token not found
        """

        key = f"django_passwordresettokenbackend_{username}"

        response = redis_client.get(key)

        if isinstance(response, bytes):
            response = response.decode("utf-8")

        return response

    def delete(self, username: str) -> bool:
        """Deletes a token from the cache.

        Returns:
            (bool) True: Successfully deleted
            (bool) False: No token associated with the given username
        """

        key = f"django_passwordresettokenbackend_{username}"

        response = redis_client.delete(key)

        if response == 0:
            return False
        elif response == 1:
            return True

    def validate(self, username: str, token: str) -> Optional[bool]:
        """Validates a token by searching any token associated with the user in cache and if
        found, matching with the given token.

        Returns:
            (bool) True: Validation successful
            (bool) False: Given token does not match the token associated with the user
            (NoneType) None: Token expired or not found

        Note:
            Tokens automatically gets deleted on expiration. So getting None from this function may mean
            either token was never created or it is expired.
        """

        key = f"django_passwordresettokenbackend_{username}"

        response = self.get(username)

        if response is None:
            return None
        elif response != token:
            return False
        return True

    def persist(self, username: str) -> None:
        """Persists a token associated with a username.

        Returns:
            (bool) True: Key has been persisted
            (bool) False: Key does not exist or does not have an associated timeout
        """

        key = f"django_passwordresettokenbackend_{username}"

        response = redis_client.persist(key)
        return response
