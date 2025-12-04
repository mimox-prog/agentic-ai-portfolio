# services/lead/scorer.py
import os, requests, json

OPENROUTER_URL = "https://api.openrouter.ai/v1/chat/completions"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "x-ai/grok-4.1-fast:free")
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
REQUEST_TIMEOUT = 10

def score_lead_with_openrouter(lead):
    """
    Call OpenRouter with a short timeout and return structured result.
    On network or DNS failure return a deterministic fallback so the app remains responsive.
    """
    if not OPENROUTER_KEY:
        return {"score": 0.5, "confidence": 0.5, "rationale": "no-openrouter-key", "raw_response": ""}

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [{"role": "user", "content": f"Score this lead: {json.dumps(lead)}"}],
        "max_tokens": 200
    }
    headers = {
        "Authorization": f"Bearer {OPENROUTER_KEY}",
        "Content-Type": "application/json"
    }
    try:
        r = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        data = r.json()
        # adapt to your agent's expected raw_response parsing
        rationale = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return {"score": 0.9, "confidence": 0.9, "rationale": rationale, "raw_response": data}
    except requests.exceptions.RequestException as e:
        # network, DNS, or HTTP error
        return {"score": 0.5, "confidence": 0.5, "rationale": f"fallback: {str(e)}", "raw_response": ""}
