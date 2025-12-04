#!/usr/bin/env bash
set -euo pipefail

# ci/local_smoke.sh
# Usage: ./ci/local_smoke.sh [HOST]
# Default HOST is 127.0.0.1:8001
#
# Exit codes:
#  0 = SMOKE OK
#  1 = SMOKE FAILED (missing fields or no scored leads)
#  2 = SMOKE WARNING (fallback scoring detected)

HOST="${1:-127.0.0.1:8001}"
ENDPOINT="http://${HOST}/qualify"
TIMEOUT=10

echo "Running local smoke test against ${ENDPOINT}"

RESP=$(curl -sS -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{"leads":[{"name":"CI Test","email":"ci@local"}]}' --max-time ${TIMEOUT} || true)

echo "Response:"
echo "${RESP}" | python3 -m json.tool || echo "${RESP}"

python3 - <<'PY'
import sys, json
txt = sys.stdin.read()
if not txt.strip():
    print("SMOKE FAILED: empty response")
    sys.exit(1)
try:
    r = json.loads(txt)
except Exception as e:
    print("SMOKE FAILED: invalid JSON response:", e)
    sys.exit(1)

if "plan" not in r or "result" not in r:
    print("SMOKE FAILED: missing plan or result keys")
    sys.exit(1)

logs = r["result"].get("logs", {})
scored = logs.get("scored_leads") or []
if not scored:
    print("SMOKE FAILED: no scored_leads found in logs")
    sys.exit(1)

for s in scored:
    rationale = str(s.get("rationale","")).lower()
    if "fallback" in rationale or "failed to resolve" in rationale or "name or service not known" in rationale:
        print("SMOKE WARNING: fallback scoring detected")
        sys.exit(2)

print("SMOKE OK")
sys.exit(0)
PY

echo "SMOKE FAILED: unexpected flow"
exit 1
