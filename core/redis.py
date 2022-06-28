from __future__ import absolute_import

import os
from dotenv import dotenv_values

from redis.client import Redis


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
conf = dotenv_values(".env")


redis_client = Redis.from_url(conf["REDIS_URL"], socket_keepalive=True, encoding="utf-8")
