from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    log_level: str = "info"
    app_dir: Path = Path("~/Desktop/viral-utils").expanduser()
    tikhub_auth_token: str = ""
    gemini_api_key: str = ""
    groq_api_key: str = ""
    openrouter_api_key: str = ""
    old_db_path: str = ""
    file_name_max_len: int = 160

    @property
    def db_path(self) -> Path:
        return self.app_dir / ".app.db"

    @property
    def config_dir(self) -> Path:
        return self.app_dir / ".config"

    @property
    def cache_dir(self) -> Path:
        return self.app_dir / ".cache"

    @property
    def temp_dir(self) -> Path:
        return self.app_dir / ".tmp"

    @property
    def source_dir(self) -> Path:
        return self.app_dir / "0-sources"

    @property
    def raw_dir(self) -> Path:
        return self.app_dir / "1-raw"

    @property
    def process_dir(self) -> Path:
        return self.app_dir / "2-processed"

    @property
    def export_dir(self) -> Path:
        return self.app_dir / "3-exports"

    @property
    def archive_dir(self) -> Path:
        return self.app_dir / "4-archives"

    @property
    def download_dir(self) -> Path:
        return self.app_dir / "5-downloads"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


def get_settings() -> Settings:
    settings = Settings()

    # normal Path attributes
    for value in vars(settings).values():
        if isinstance(value, Path) and not value.suffix:
            value.mkdir(parents=True, exist_ok=True)

    # @property Path attributes
    for name, attr in type(settings).__dict__.items():
        if isinstance(attr, property):
            value = getattr(settings, name)

            if isinstance(value, Path) and not value.suffix:
                value.mkdir(parents=True, exist_ok=True)

    return settings


settings = get_settings()
