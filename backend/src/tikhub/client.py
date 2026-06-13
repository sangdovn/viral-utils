import asyncio
import json
import logging
from pathlib import Path
from typing import Any

import httpx
from openai import default_headers
from pydantic import ValidationError

from src.rate_limit.limit import RateLimiter
from src.tikhub.constants import DEFAULT_HEADERS, TIKHUB_BASE_URL
from src.tikhub.exceptions import TikHubError, TikHubValidationError
from src.tikhub.schemas import UserPostVideosResponse

logger = logging.getLogger(__name__)


class TikHubClient:
    def __init__(self):
        self.limiter = RateLimiter(capacity=5, refill_rate=1)

    async def fetch_multi_video(self, video_ids: list[str]) -> Any:
        url = TIKHUB_BASE_URL + "/fetch_multi_video"
        headers = DEFAULT_HEADERS
        logger.info(default_headers)
        await self.limiter.wait("tikhub")

        async with httpx.AsyncClient() as client:
            response = await client.post(url=url, headers=headers, json=video_ids)
            return response.json()

    async def fetch_user_post_videos(
        self,
        sec_uid: str,
        max_cursor: int = 0,
        count: int = 999,
    ) -> UserPostVideosResponse:
        url = TIKHUB_BASE_URL + "/fetch_user_post_videos"
        headers = DEFAULT_HEADERS
        params = {
            "sec_user_id": sec_uid,
            "max_cursor": max_cursor,
            "count": count,
        }

        try:
            await self.limiter.wait("tikhub")
            async with httpx.AsyncClient() as client:
                res = await client.get(url=url, headers=headers, params=params)
                res.raise_for_status()
                Path("res_raw").write_text(json.dumps(res.json()))
                return UserPostVideosResponse.model_validate(res.json())
        except httpx.HTTPStatusError as e:
            raise TikHubError(e.response.text) from e
        except httpx.RequestError as e:
            raise TikHubError(f"Request failed - {e}") from e
        except ValidationError as e:
            raise TikHubValidationError(f"Response validation failed: {e}") from e
        except Exception as e:
            raise TikHubError(f"Unknown error {e}") from e

    async def fetch_multi_user_post_videos(
        self,
        sec_user_ids: list[str],
        max_cursor: int,
        count: int,
    ) -> list[UserPostVideosResponse]:
        tasks = [
            self.fetch_user_post_videos(
                sec_uid=id,
                max_cursor=max_cursor,
                count=count,
            )
            for id in sec_user_ids
        ]
        return await asyncio.gather(*tasks)
