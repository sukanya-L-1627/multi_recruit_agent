"""
Gemini API client using the new google-genai SDK (v1.x).
Auto-falls through a model chain when quota is exhausted.
"""
import os
import time
import logging
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
logger = logging.getLogger(__name__)

# Model preference chain — tries each in order until one succeeds
MODEL_CHAIN = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-lite",
    "gemini-flash-lite-latest",
]

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not set in backend/.env")
        _client = genai.Client(api_key=api_key)
        logger.info("Gemini client (google-genai SDK) initialized.")
    return _client


def generate_text(prompt: str, max_tokens: int = 1024) -> str:
    """
    Generate text using Gemini. Tries each model in MODEL_CHAIN.
    Returns fallback text if all models fail.
    """
    client = _get_client()
    last_error = None

    for model in MODEL_CHAIN:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=max_tokens,
                    temperature=0.7,
                ),
            )
            logger.debug(f"Used model: {model}")
            return response.text.strip()

        except Exception as e:
            err_str = str(e)
            last_error = err_str
            logger.warning(f"Gemini error with {model}: {e}. Trying next model in chain...")
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                time.sleep(1)
            continue

    logger.error(f"All models exhausted. Last error: {last_error}")
    return f"[AI_QUOTA_EXCEEDED: All Gemini models quota exhausted. Please wait and retry.]"


def generate_json(prompt: str, max_tokens: int = 1024) -> str:
    """
    Generate JSON text using Gemini. Forces application/json mime type.
    """
    client = _get_client()
    last_error = None

    for model in MODEL_CHAIN:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=max_tokens,
                    temperature=0.2,  # Lower temperature is better for structural correctness
                    response_mime_type="application/json",
                ),
            )
            logger.debug(f"Used model: {model} for JSON generation")
            return response.text.strip()

        except Exception as e:
            err_str = str(e)
            last_error = err_str
            logger.warning(f"Gemini error with {model}: {e}. Trying next model in chain...")
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                time.sleep(1)
            continue

    logger.error(f"All models exhausted for JSON. Last error: {last_error}")
    return "{}"
