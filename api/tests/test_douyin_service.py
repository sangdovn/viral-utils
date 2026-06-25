import asyncio

from src.douyin.service import fetch_user_latest_videos
from src.tikhub.exceptions import TikHubRequestError, TikHubStatusError


class FailingTikHubClient:
    def __init__(self):
        self.calls = 0

    async def fetch_user_post_videos(self, sec_uid: str):
        self.calls += 1
        raise TikHubRequestError()


class BadRequestTikHubClient:
    def __init__(self):
        self.calls = 0

    async def fetch_user_post_videos(self, sec_uid: str):
        self.calls += 1
        raise TikHubStatusError(upstream_status_code=400)


def test_fetch_user_latest_videos_returns_empty_after_tikhub_retries():
    async def run():
        client = FailingTikHubClient()

        user, videos = await fetch_user_latest_videos("sec-uid", client)

        assert client.calls == 3
        assert user == {}
        assert videos == []

    asyncio.run(run())


def test_fetch_user_latest_videos_does_not_retry_bad_request():
    async def run():
        client = BadRequestTikHubClient()

        user, videos = await fetch_user_latest_videos("sec-uid", client)

        assert client.calls == 1
        assert user == {}
        assert videos == []

    asyncio.run(run())
