from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_dialect: str
    database_driver: str
    database_path: str

    model_config = SettingsConfigDict(env_file=(".env", ".env.prod"))

    @property
    def async_database_url(self) -> str:
        return f"{self.database_dialect}+{self.database_driver}:///{self.database_path}"

    @property
    def sync_database_url(self) -> str:
        return f"{self.database_dialect}:///{self.database_path}"


@lru_cache
def get_settings():
    return Settings()
