import logging
import sys

from src.config import get_settings

_SILENCED = ("google_genai", "httpx", "httpcore", "urllib3", "aiosqlite")


def setup_logging() -> None:
    logging.basicConfig(
        level=get_settings().log_level.upper(),
        format="%(levelname)-8s %(asctime)s %(name)s:%(lineno)d - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        stream=sys.stdout,
        force=True,
    )

    for name in _SILENCED:
        logging.getLogger(name).propagate = False
