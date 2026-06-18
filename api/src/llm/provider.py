from typing import Protocol


class Provider(Protocol):
    def complete(
        self,
        instruction: str,
        prompt: str,
        temperature: float | None = None,
    ) -> str:
        """Send a prompt to LLM and return the response text."""
        ...
