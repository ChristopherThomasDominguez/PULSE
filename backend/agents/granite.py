"""
granite.py — IBM Granite direct inference
Uses ibm_watsonx_ai SDK (Han's working implementation).
Falls back to mock mode if credentials are missing.
"""

import os
import json
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(usecwd=True))

IBM_API_KEY   = os.getenv("IBM_API_KEY", "")
IBM_PROJECT_ID = os.getenv("IBM_PROJECT_ID", "")
IBM_URL       = os.getenv("IBM_URL", "https://us-south.ml.cloud.ibm.com")

MOCK = not (IBM_API_KEY and IBM_PROJECT_ID)

if not MOCK:
    try:
        from ibm_watsonx_ai import Credentials
        from ibm_watsonx_ai.foundation_models import ModelInference

        _credentials = Credentials(api_key=IBM_API_KEY, url=IBM_URL)
        _params = {
            "decoding_method": "greedy",
            "max_new_tokens": 1024,
            "min_new_tokens": 10,
            "temperature": 0,
        }
        _model = ModelInference(
            model_id="ibm/granite-4-h-small",
            credentials=_credentials,
            project_id=IBM_PROJECT_ID,
            params=_params,
        )
        print("[Granite] ✅ Connected to IBM watsonx — ibm/granite-4-h-small")
    except Exception as e:
        print(f"[Granite] ⚠️  SDK init failed, falling back to mock: {e}")
        MOCK = True
else:
    print("[Granite] ⚙️  Running in mock mode (no credentials)")


def granite_generate(prompt: str, max_tokens: int = 512) -> str:
    """
    Generate text from IBM Granite.
    Returns raw string. Caller is responsible for JSON parsing.
    """
    if MOCK:
        return "__MOCK__"

    try:
        # Wrap in Granite instruct chat format
        formatted = f"<|system|>\nYou are a helpful medical assistant. Respond only with valid JSON.\n<|user|>\n{prompt}\n<|assistant|>\n"
        result = _model.generate_text(formatted)
        print(f"[Granite] raw response: {repr(result)}")
        return result.strip() if result else "__MOCK__"
    except Exception as e:
        print(f"[Granite] generation error: {e}")
        return "__MOCK__"
