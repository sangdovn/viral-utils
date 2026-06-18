from pathlib import Path
from typing import Any, cast

from yt_dlp import YoutubeDL

from src.download.exceptions import DownloadError

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0"
)


class NullLogger:
    def debug(self, msg, *a, **k):
        pass

    def info(self, msg, *a, **k):
        pass

    def warning(self, msg, *a, **k):
        pass

    def error(self, msg, *a, **k):
        pass


DEFAULT_DOWNLOAD_OPTION = {
    # Best quality
    "format": "bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[ext=mp4]/best",
    # Merge format
    "merge_output_format": "mp4",  # default: None (auto)
    # Networking
    "retries": 20,  # default: 10
    "fragment_retries": 20,  # default: 10
    "socket_timeout": 60,  # default: None (no limit)
    # Download progress
    "quiet": True,  # Hide yt-dlp download messages
    "no_warnings": True,  # Hide warnings
    "noprogress": True,
    # Browser identity
    "user_agent": DEFAULT_USER_AGENT,
    # Log
    "logger": NullLogger(),
}


def download(url: str, path: str | Path) -> bool:
    opts = cast(Any, {**DEFAULT_DOWNLOAD_OPTION, "outtmpl": str(path)})
    try:
        with YoutubeDL(opts) as ydl:
            ydl.download([url])
        return True
    except Exception as e:
        raise DownloadError(e) from e
