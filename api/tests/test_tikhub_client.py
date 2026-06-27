import asyncio

import httpx
import pytest

from src.tikhub.client import TikHubClient
from src.tikhub.constants import DEFAULT_USER_POST_VIDEO_COUNT
from src.tikhub.exceptions import TikHubStatusError


def test_fetch_user_post_videos_uses_safe_default_count(monkeypatch):
    captured_params = None
    async_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal captured_params
        captured_params = dict(request.url.params)
        return httpx.Response(
            200,
            json={
                "code": 0,
                "message": "ok",
                "data": {
                    "status_code": 0,
                    "min_cursor": 0,
                    "max_cursor": 0,
                    "has_more": 0,
                    "aweme_list": [],
                },
            },
        )

    transport = httpx.MockTransport(handler)

    def client_factory(*args, **kwargs):
        return async_client(transport=transport)

    monkeypatch.setattr(httpx, "AsyncClient", client_factory)

    async def run():
        await TikHubClient().fetch_user_post_videos(sec_uid="sec-uid")

    asyncio.run(run())

    assert captured_params is not None
    assert captured_params["sec_user_id"] == "sec-uid"
    assert captured_params["max_cursor"] == "0"
    assert captured_params["count"] == str(DEFAULT_USER_POST_VIDEO_COUNT)
    assert captured_params["sort_type"] == "0"


def test_fetch_user_post_videos_includes_error_detail(monkeypatch):
    async_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(400, text="count must be less than or equal to 20")

    transport = httpx.MockTransport(handler)

    def client_factory(*args, **kwargs):
        return async_client(transport=transport)

    monkeypatch.setattr(httpx, "AsyncClient", client_factory)

    async def run():
        with pytest.raises(TikHubStatusError) as exc:
            await TikHubClient().fetch_user_post_videos(sec_uid="sec-uid")
        return exc

    exc = asyncio.run(run())

    assert "400" in exc.value.message
    assert exc.value.upstream_status_code == 400
    assert "count must be less than or equal to 20" in exc.value.message
