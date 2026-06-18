from enum import StrEnum


class LLMProvider(StrEnum):
    GEMINI = "gemini"  # Google Gemini - native SDK, no base_url
    GROQ = "groq"  # Groq - OpenAI-compat, fastest inference
    OPENROUTER = "openrouter"  # OpenRouter - multi-provider gateway, free tiers


PROVIDER_BASE_URL = {
    LLMProvider.GROQ: "https://api.groq.com/openai/v1",
    LLMProvider.OPENROUTER: "https://openrouter.ai/api/v1",
}

LLM_MODELS = [
    # --- Gemini 3 / 3.5 Generation (Current Flagships) ---
    {
        "provider": LLMProvider.GEMINI,
        "model_id": "gemini-3.5-flash",
    },  # Newest stable default Flash model
    {
        "provider": LLMProvider.GEMINI,
        "model_id": "gemini-3.1-pro-preview",
    },  # Active Pro preview for complex coding/reasoning
    {
        "provider": LLMProvider.GEMINI,
        "model_id": "gemini-3.1-flash-lite",
    },  # Ultra-fast, low-cost stable model
    {
        "provider": LLMProvider.GEMINI,
        "model_id": "gemini-3-flash-preview",
    },  # Early Gemini 3 preview, still supported
    # --- Gemini 2.5 Generation (Stable Production Long-Context) ---
    {
        "provider": LLMProvider.GEMINI,
        "model_id": "gemini-2.5-pro",
    },  # High-reasoning deep math/STEM model
    {
        "provider": LLMProvider.GEMINI,
        "model_id": "gemini-2.5-flash",
    },  # Reliable price-performance model
    {
        "provider": LLMProvider.GEMINI,
        "model_id": "gemini-2.5-flash-lite",
    },  # Budget-friendly multimodal model
    # --- Groq: Flagship OpenAI Open Weights ---
    {
        "provider": LLMProvider.GROQ,
        "model_id": "openai/gpt-oss-120b",
    },  # OpenAI flagship open-weight engine
    {
        "provider": LLMProvider.GROQ,
        "model_id": "openai/gpt-oss-20b",
    },  # Lighter OpenAI open-weight engine
    # --- Groq: Meta Llama Series (Production Flagships) ---
    {
        "provider": LLMProvider.GROQ,
        "model_id": "llama-3.3-70b-versatile",
    },  # Best general-purpose Llama model
    {
        "provider": LLMProvider.GROQ,
        "model_id": "meta-llama/llama-4-scout-17b-16e-instruct",
    },  # Llama 4 Scout, official namespace
    {
        "provider": LLMProvider.GROQ,
        "model_id": "llama-3.1-8b-instant",
    },  # Ultra-fast lightweight model
    # --- Groq: Alibaba Qwen Series ---
    {
        "provider": LLMProvider.GROQ,
        "model_id": "qwen/qwen3-32b",
    },  # Strong multilingual reasoning
    # --- OpenRouter: Free Tiers ---
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "openai/gpt-oss-120b:free",
    },  # OpenAI flagship open-weight engine
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "nvidia/nemotron-3-super:free",
    },  # Ultra-efficient 120B hybrid MoE
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "openrouter/owl-alpha:free",
    },  # OpenRouter native agentic/tool-calling model
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "deepseek/deepseek-v4-flash:free",
    },  # Massive throughput, replaces V3-0324
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "meta-llama/llama-4-maverick:free",
    },  # Meta dominant free tier flagship
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "poolside/laguna-m1:free",
    },  # SOTA coding agent model
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "minimax/minimax-m2.5:free",
    },  # Top-tier file manipulation & office work
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "z-ai/glm-4.5-air:free",
    },  # Zhipu agent-centric reasoning with thinking mode
    # --- OpenRouter: Standard / Paid Tiers ---
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "zhipu/glm-5",
    },  # Frontier general knowledge & complex reasoning
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "openai/gpt-5.4",
    },  # Absolute apex frontier reasoning model
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "google/gemini-3.1-pro",
    },  # Massive multimodal analysis & native image outputs
    {
        "provider": LLMProvider.OPENROUTER,
        "model_id": "anthropic/claude-3.5-sonnet",
    },  # Reliable gold-standard production workhorse
]
