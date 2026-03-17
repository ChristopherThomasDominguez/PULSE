import requests
from backend.config import cfg

MOCK = not cfg.is_granite_configured()

def get_ibm_token():
    res = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        data={
            "apikey": cfg.WATSONX_API_KEY,
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        },
    )
    return res.json()["access_token"]

def granite_generate(prompt: str, max_tokens: int = 512) -> str:
    if MOCK:
        return "__MOCK_RESPONSE__"
    token = get_ibm_token()
    res = requests.post(
        f"{cfg.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={
            "model_id": cfg.GRANITE_MODEL_ID,
            "project_id": cfg.WATSONX_PROJECT_ID,
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": max_tokens,
                "stop_sequences": ["</s>"],
            },
        },
        timeout=30,
    )
    return res.json()["results"][0]["generated_text"].strip()