from google import genai

from src.llm.exceptions import EmptyResponseError, LLMError, normalize_error
from src.llm.provider import Provider


class GeminiProvider(Provider):
    def __init__(self, model_id: str, api_key: str):
        self.model_id = model_id
        self._client: genai.Client | None = None
        self._api_key = api_key

    def _get_client(self) -> genai.Client:
        if self._client is None:
            self._client = genai.Client(api_key=self._api_key)
        return self._client

    def complete(
        self,
        instruction: str,
        prompt: str,
        temperature: float | None = 0.3,
    ) -> str:
        try:
            response = self._get_client().models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    system_instruction=instruction,
                    temperature=temperature,
                ),
            )
            if response.text is None:
                raise EmptyResponseError("Empty response")
            return response.text.strip()
        except LLMError:
            raise
        except Exception as e:
            raise normalize_error(e) from e
