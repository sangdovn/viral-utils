from src.config import settings

TIKHUB_BASE_URL = "https://api.tikhub.io/api/v1/douyin/app/v3"
DOUIYIN_USER_BASE_URL = "https://www.douyin.com/user"
DEFAULT_USER_POST_VIDEO_COUNT = 20
DEFAULT_HEADERS = {
    "Accept": "application/json",
    "Authorization": f"Bearer {settings.tikhub_auth_token}",
}
