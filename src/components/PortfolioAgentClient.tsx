"use client";
import { useState } from "react";

export default function PortfolioAgentClient({ slug = "portfolio-agent" }: { slug?: string }) {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setLogs([]);
    setStatus(null);
    try {
      const res = await fetch("/api/portfolio-agent/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      setStatus(data.status);
      setLogs(data.logs || []);
    } catch (err) {
      setLogs([{ ts: new Date().toISOString(), step: "error", status: "failed", message: String(err) }]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="glass p-4 rounded">
      <div className="flex gap-3">
        <button onClick={run} disabled={running} className="px-3 py-2 bg-blue-600 rounded text-white">{running ? "Running…" : "Run pipeline"}</button>
        <div className="ml-auto">Status: <strong>{status ?? "idle"}</strong></div>
      </div>

      <div className="mt-3 h-48 overflow-auto bg-black/40 p-2 text-xs rounded">
        <pre>{JSON.stringify(logs, null, 2)}</pre>
      </div>
    </div>
  );
}
