from typing import Annotated

from fastapi import Depends

from src.tikhub.client import TikHubClient


def get_tikhub_client() -> TikHubClient:
    return TikHubClient()


TikHubClientDep = Annotated[TikHubClient, Depends(get_tikhub_client)]
