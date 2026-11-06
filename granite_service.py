"""
granite_service.py
IBM Granite client using the ibm-watsonx-ai Python SDK.
Provides chat (multi-turn) and generate_text (single-turn) helpers.
Compatible with Python 3.8+.
"""

import os
from typing import Dict, List, Optional

from dotenv import load_dotenv
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

load_dotenv()

# ── Singleton model instance ────────────────────────────────────────

_model: Optional[ModelInference] = None


def _get_model() -> ModelInference:
    global _model
    if _model is not None:
        return _model

    api_key    = os.getenv("IBM_API_KEY", "")
    project_id = os.getenv("WATSONX_PROJECT_ID", "")
    url        = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    model_id   = os.getenv("GRANITE_MODEL_ID", "ibm/granite-3-8b-instruct")

    if not api_key or api_key == "your_ibm_cloud_api_key_here":
        raise ValueError(
            "IBM_API_KEY is not set. Add your key to the .env file.\n"
            "Get one at: https://cloud.ibm.com → Manage → Access (IAM) → API keys"
        )
    if not project_id or project_id == "your_watsonx_project_id_here":
        raise ValueError(
            "WATSONX_PROJECT_ID is not set. Add your project ID to the .env file.\n"
            "Find it at: https://dataplatform.cloud.ibm.com → Project → Manage → General"
        )

    credentials = Credentials(url=url, api_key=api_key)
    # No default params here — each call supplies its own to avoid conflicts.
    _model = ModelInference(
        model_id=model_id,
        credentials=credentials,
        project_id=project_id,
    )
    return _model


# ── Public helpers ──────────────────────────────────────────────────

def chat_with_granite(
    user_message: str,
    history: List[Dict],
    system_prompt: str = "",
) -> str:
    """
    Multi-turn chat via IBM Granite.

    Args:
        user_message:  Latest user message.
        history:       List of {"role": "user"|"assistant", "content": str}.
        system_prompt: System-level instruction string.

    Returns:
        Assistant reply text.
    """
    model = _get_model()

    messages: List[Dict] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})

    # Keep last 10 turns to stay within token budget
    for turn in history[-10:]:
        if turn.get("role") and turn.get("content"):
            messages.append({"role": turn["role"], "content": turn["content"]})

    messages.append({"role": "user", "content": user_message})

    response = model.chat(
        messages=messages,
        params={
            GenParams.MAX_NEW_TOKENS:      800,
            GenParams.TEMPERATURE:         0.7,
            GenParams.TOP_P:               0.9,
            GenParams.REPETITION_PENALTY:  1.1,
        },
    )

    reply: str = (
        response.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )
    return reply or "I could not generate a response. Please try again."


def generate_text(prompt: str, max_tokens: int = 600) -> str:
    """
    Single-turn text generation via IBM Granite.

    Args:
        prompt:     Full prompt string.
        max_tokens: Maximum tokens in the response.

    Returns:
        Generated text string.
    """
    model = _get_model()
    response = model.generate_text(
        prompt=prompt,
        params={
            GenParams.MAX_NEW_TOKENS:      max_tokens,
            GenParams.MIN_NEW_TOKENS:      10,
            GenParams.TEMPERATURE:         0.6,
            GenParams.TOP_P:               0.9,
            GenParams.REPETITION_PENALTY:  1.1,
        },
    )
    return (response or "").strip()
