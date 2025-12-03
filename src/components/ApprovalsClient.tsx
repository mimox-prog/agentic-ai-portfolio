"use client";
import { useEffect, useState } from "react";

type Approval = {
  id: string;
  projectId?: string;
  planId?: string;
  step: { id: string; action: string; rationale?: string };
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  resolvedAt?: string;
};

export default function ApprovalsClient() {
  const [reqs, setReqs] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  async function fetchReqs() {
    setLoading(true);
    try {
      const res = await fetch("/api/approvals");
      const data = await res.json();
      setReqs(data.requests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReqs();
    const t = setInterval(fetchReqs, 3000);
    return () => clearInterval(t);
  }, []);

  async function act(id: string, action: "approve" | "reject") {
    setActioning(id);
    try {
      await fetch("/api/approvals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      await fetchReqs();
    } catch (e) {
      console.error(e);
    } finally {
      setActioning(null);
    }
  }

  return (
    <div className="glass p-4 rounded">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Approvals</div>
        <div className="text-xs text-neutral-400">{loading ? "Refreshing…" : "Live"}</div>
      </div>

      <div className="mt-3 space-y-3">
        {reqs.length === 0 && <div className="text-sm text-neutral-400">No pending approvals</div>}
        {reqs.map((r) => (
          <div key={r.id} className="p-3 bg-black/20 rounded">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{r.step.action}</div>
                <div className="text-xs text-neutral-300">Project: {r.projectId || "—"} • Plan: {r.planId || "—"}</div>
                <div className="text-xs mt-2">{r.step.rationale}</div>
                <div className="text-xs text-neutral-400 mt-1">Requested: {r.createdAt || "—"}</div>
                {r.status !== "pending" && <div className="text-xs mt-1">Status: {r.status} {r.resolvedAt ? `• ${r.resolvedAt}` : ""}</div>}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => act(r.id, "approve")}
                  disabled={r.status !== "pending" || actioning === r.id}
                  className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => act(r.id, "reject")}
                  disabled={r.status !== "pending" || actioning === r.id}
                  className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
