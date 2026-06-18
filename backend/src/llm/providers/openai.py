from openai import OpenAI

from src.llm.exceptions import EmptyResponseError, LLMError, normalize_error


class OpenAICompatProvider:
    def __init__(self, model_id: str, api_key: str, base_url: str):
        self.model_id = model_id
        self.api_key = api_key
        self.base_url = base_url
        self._client: OpenAI | None = None

    def _get_client(self) -> OpenAI:
        if self._client is None:
            self._client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
            )
        return self._client

    def complete(
        self,
        instruction: str,
        prompt: str,
        temperature: float | None = 0.3,
    ) -> str:
        try:
            response = self._get_client().chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": instruction},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
            )
            content = response.choices[0].message.content
            if content is None:
                raise EmptyResponseError("Empty response")
            return content.strip()
        except LLMError:
            raise
        except Exception as e:
            raise normalize_error(e) from e
