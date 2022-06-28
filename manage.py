#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""

    __import__("dotenv").load_dotenv(".env")

    # Until we set the Django Secret Key as a variable, a temporary 'fake' settings file
    # will work in place of original one to allow Django to run the command properly
    if not os.environ.get("DJANGO_SECRET_KEY"):
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.fake_settings")
    else:
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

    __import__("django").setup()

    from django.core.management.commands.runserver import Command as runserver

    runserver.protocol = os.environ["DJANGO_PROTOCOL"]
    runserver.default_addr = os.environ["DJANGO_HOSTNAME"]
    runserver.default_port = os.environ["DJANGO_PORT"]

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
