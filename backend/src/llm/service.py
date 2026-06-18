import logging
from typing import cast

from src.config import settings
from src.llm.constants import PROVIDER_BASE_URL, LLMProvider
from src.llm.exceptions import LLMAllModelsFailed
from src.llm.provider import Provider
from src.llm.providers.gemini import GeminiProvider
from src.llm.providers.openai import OpenAICompatProvider
from src.llm.schemas import LLMModel

logger = logging.getLogger(__name__)


def _resolve_base_url(model: LLMModel) -> str | None:
    if model.provider == LLMProvider.GEMINI:
        return None  # uses SDK default
    base_url = PROVIDER_BASE_URL.get(model.provider)
    if not base_url:
        raise RuntimeError(f"Missing base_url for provider {model.provider!r}")
    return base_url


def _resolve_api_key(model: LLMModel) -> str:
    if model.api_key:
        return model.api_key
    env_keys = {
        LLMProvider.GEMINI: settings.gemini_api_key,
        LLMProvider.GROQ: settings.groq_api_key,
        LLMProvider.OPENROUTER: settings.openrouter_api_key,
    }
    key = env_keys.get(model.provider)
    if not key:
        raise ValueError(
            f"No API key for provider {model.provider!r} - set in .env or pass in request"
        )
    return key


def _resolve_provider(model: LLMModel) -> Provider:
    api_key = _resolve_api_key(model)
    base_url = _resolve_base_url(model)
    match model.provider:
        case LLMProvider.GEMINI:
            return GeminiProvider(model_id=model.model_id, api_key=api_key)
        case LLMProvider.GROQ | LLMProvider.OPENROUTER:
            return OpenAICompatProvider(
                model_id=model.model_id, api_key=api_key, base_url=cast(str, base_url)
            )
        case _:
            raise RuntimeError(f"Cannot resolve llm model - {model.provider}")


def complete(models: list[LLMModel], instruction: str, prompt: str) -> str:
    for model in models:
        try:
            provider = _resolve_provider(model)
            return provider.complete(instruction=instruction, prompt=prompt)
        except (ValueError, RuntimeError):
            raise  # config errors - don't retry, fail fast
        except Exception as e:
            logger.warning("model %s failed: %s, trying next", model.model_id, e)
    raise LLMAllModelsFailed()
