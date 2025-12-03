"use client";
import { useEffect, useState } from "react";

type Agent = { id: string; name: string; enabled: boolean; intervalSec?: number; lastRun?: string; status?: string };

export default function AgentConsoleClient() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchState() {
    setLoading(true);
    const res = await fetch("/api/agents");
    const data = await res.json();
    setAgents(data.agents || []);
    setLogs(data.logs || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchState();
    const t = setInterval(fetchState, 4000);
    return () => clearInterval(t);
  }, []);

  async function toggle(agent: Agent) {
    await fetch(`/api/agents/${agent.id}/control`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: agent.enabled ? "disable" : "enable" }),
    });
    fetchState();
  }

  return (
    <div className="glass p-4 rounded">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Agent Console</div>
        <div className="text-xs text-neutral-400">{loading ? "Refreshing…" : "Live"}</div>
      </div>

      <div className="mt-3 space-y-3">
        {agents.map((a) => (
          <div key={a.id} className="p-3 bg-black/20 rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-neutral-400">Status: {a.status || "idle"} • Last run: {a.lastRun || "—"}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(a)} className="px-3 py-1 rounded bg-cyan-600 text-white text-sm">
                  {a.enabled ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="font-semibold text-sm">Recent logs</div>
        <div className="mt-2 h-40 overflow-auto bg-black/30 p-2 text-xs rounded">
          <pre>{JSON.stringify(logs.slice(0, 80), null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
