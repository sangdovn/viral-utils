from pydantic import BaseModel

from src.llm.constants import LLMProvider


class LLMModel(BaseModel):
    provider: LLMProvider
    model_id: str
    api_key: str | None = None
