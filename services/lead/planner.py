import time
def plan_for_leads(leads):
    return {
        "planId": f"lead-{int(time.time())}",
        "steps": [
            {"id":"normalize","action":"normalize-leads"},
            {"id":"score","action":"score-leads","usesLLM":True},
            {"id":"export","action":"export-qualified","requiresApproval":True}
        ],
        "leads_count": len(leads)
    }
