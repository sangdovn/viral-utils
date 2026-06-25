from src.llm.exceptions import LLMAllModelsFailedError


def test_all_llm_models_failed_error_has_default_response_details():
    error = LLMAllModelsFailedError()

    assert error.message == "All LLM models failed"
    assert error.status_code == 502
