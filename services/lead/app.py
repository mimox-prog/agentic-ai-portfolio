# services/lead/app.py
from fastapi import FastAPI, Request, HTTPException
from typing import List, Dict

# import health router (must exist)
from .health import router as health_router

app = FastAPI(title="Lead Qualifier Service")

# include health endpoints
app.include_router(health_router)

# Try to import a batch scorer from executor (preferred).
# If executor is not present or uses different names, fall back to scorer.
try:
    # executor.py is expected to expose a function like: def score_leads_batch(leads: List[Dict]) -> List[Dict]
    from .executor import score_leads_batch  # type: ignore
    _scoring_source = "executor"
except Exception:
    try:
        # scorer.py is expected to expose a single-lead scorer: def score_lead_with_openrouter(lead: Dict) -> Dict
        from .scorer import score_lead_with_openrouter as _single_score  # type: ignore

        def score_leads_batch(leads: List[Dict]) -> List[Dict]:
            return [{**lead, **_single_score(lead)} for lead in leads]

        _scoring_source = "scorer"
    except Exception:
        # If neither import works, provide a deterministic fallback scorer
        def score_leads_batch(leads: List[Dict]) -> List[Dict]:
            return [{**lead, **{"score": 0.5, "confidence": 0.5, "rationale": "no-scorer-available", "raw_response": ""}} for lead in leads]

        _scoring_source = "fallback"


@app.get("/")
def root():
    return {"service": "lead-qualifier", "status": "ready", "scoring_source": _scoring_source}


@app.post("/qualify")
async def qualify_endpoint(request: Request):
    """
    Accepts JSON body: {"leads": [ {...}, ... ]}
    Returns: {"plan": {"leads_count": N}, "result": {"scored_leads": [...]}}
    Uses executor.score_leads_batch if available, otherwise falls back to scorer or deterministic fallback.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="invalid JSON body")

    leads = body.get("leads")
    if not isinstance(leads, list):
        raise HTTPException(status_code=400, detail="request must include 'leads' list")

    # Call the batch scorer (synchronous). If your scorer is async, adapt accordingly.
    try:
        scored = score_leads_batch(leads)
    except Exception as e:
        # Ensure the endpoint always returns a predictable structure even on scorer errors
        scored = [{**lead, **{"score": 0.5, "confidence": 0.5, "rationale": f"scoring-error: {str(e)}", "raw_response": ""}} for lead in leads]

    plan = {"leads_count": len(leads)}
    result = {"scored_leads": scored}
    return {"plan": plan, "result": result}
