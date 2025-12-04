# services/lead/health.py
from fastapi import APIRouter
import os, requests

router = APIRouter()

@router.get("/health")
def health():
    key_present = bool(os.getenv("OPENROUTER_API_KEY"))
    model_reachable = False
    if key_present:
        try:
            r = requests.head("https://api.openrouter.ai/v1/chat/completions", timeout=3)
            model_reachable = r.status_code < 500
        except Exception:
            model_reachable = False
    return {"ok": True, "openrouter_key_present": key_present, "model_reachable": model_reachable}
