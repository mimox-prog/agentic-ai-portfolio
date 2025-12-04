# services/lead/executor.py
import asyncio
import json
from pathlib import Path
from typing import Dict, Any, List
import sqlite3
import time

from .scorer import score_leads_batch

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOG_PATH = DATA_DIR / "agent-logs.json"
DB_PATH = DATA_DIR / "runs.db"

# Ensure SQLite DB and table
def _init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS runs (
      run_id TEXT PRIMARY KEY,
      created_at INTEGER,
      status TEXT,
      summary TEXT
    )
    """)
    conn.commit()
    conn.close()

_init_db()

def _append_log(entry: Dict[str, Any]) -> None:
    logs = []
    if LOG_PATH.exists():
        try:
            logs = json.loads(LOG_PATH.read_text(encoding="utf-8"))
        except Exception:
            logs = []
    logs.append(entry)
    LOG_PATH.write_text(json.dumps(logs, indent=2), encoding="utf-8")

def _persist_run(run_id: str, status: str, summary: Dict[str, Any]):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT OR REPLACE INTO runs (run_id, created_at, status, summary) VALUES (?, ?, ?, ?)",
                (run_id, int(time.time()), status, json.dumps(summary)))
    conn.commit()
    conn.close()

async def execute_plan(plan: Dict[str, Any]) -> Dict[str, Any]:
    run_id = plan.get("planId")
    leads = plan.get("leads", [])
    _append_log({"event": "plan_started", "runId": run_id, "plan": plan, "ts": int(time.time())})
    _persist_run(run_id, "running", {"leads_count": len(leads)})

    run_summary = {"runId": run_id, "steps": [], "status": "running"}

    for step in plan.get("steps", []):
        step_id = step.get("id")
        _append_log({"event": "step_started", "runId": run_id, "step": step_id, "ts": int(time.time())})
        step_entry = {"step": step_id, "status": "started"}
        run_summary["steps"].append(step_entry)

        # simulate small delay
        await asyncio.sleep(0.2)

        if step.get("usesLLM"):
            # call LangChain scorer
            scored = score_leads_batch(leads)
            step_entry.update({"status": "scored", "detail": {"sample": scored[:3]}})
            run_summary["scored_leads"] = scored
            _append_log({"event": "step_scored", "runId": run_id, "step": step_id, "sample": scored[:3], "ts": int(time.time())})

        # If step requires approval, mark pending and stop
        if step.get("requiresApproval"):
            step_entry["status"] = "pending_approval"
            _append_log({"event": "step_pending_approval", "runId": run_id, "step": step_id, "ts": int(time.time())})
            _persist_run(run_id, "pending", {"step": step_id, "scored_count": len(run_summary.get("scored_leads", []))})
            return {"logs": run_summary, "status": "pending_approval"}

        step_entry["status"] = "succeeded"
        _append_log({"event": "step_succeeded", "runId": run_id, "step": step_id, "ts": int(time.time())})

    run_summary["status"] = "completed"
    _append_log({"event": "plan_completed", "runId": run_id, "result": run_summary, "ts": int(time.time())})
    _persist_run(run_id, "completed", {"summary": run_summary})
    return {"logs": run_summary, "status": "completed"}
