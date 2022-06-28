from __future__ import annotations
from typing import Any

from django.core.management.base import BaseCommand
from django.core.management.utils import get_random_secret_key
from django.core.checks.security.base import SECRET_KEY_INSECURE_PREFIX


class Command(BaseCommand):
    help = "Generates a random 'django-insecure-' secret key"

    def handle(self, *args: Any, **options: Any) -> None:
        secret_key = SECRET_KEY_INSECURE_PREFIX + get_random_secret_key()
        self.stdout.write("Secret Key: " + self.style.SUCCESS(secret_key) + "\n\n")
        self.stdout.write(
            self.style.WARNING(
                "Note that this key is generated automatically by Django. "
                "You should generate a long and random SECRET_KEY, otherwise many of Django’s security-critical features will be vulnerable to attack"
            )
        )
