"use client";
import { useEffect, useRef, useState } from "react";

export default function LeadQualifierClient() {
  const [email, setEmail] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const evtSourceRef = useRef<EventSource | null>(null);

  function startStream() {
    if (!email) return;
    // open SSE connection
    const sse = new EventSource(`/api/lead-qualifier/stream`, { withCredentials: false });
    evtSourceRef.current = sse;

    sse.addEventListener("log", (e: any) => {
      const d = JSON.parse(e.data);
      setLogs((l) => [...l, d]);
    });
    sse.addEventListener("enrichment", (e: any) => {
      const d = JSON.parse(e.data);
      setLogs((l) => [...l, { ts: new Date().toISOString(), level: "info", message: "Enrichment", data: d }]);
    });
    sse.addEventListener("score", (e: any) => {
      const d = JSON.parse(e.data);
      setScore(d.score);
    });
    sse.addEventListener("action", (e: any) => {
      const d = JSON.parse(e.data);
      setAction(d.action);
      setLogs((l) => [...l, { ts: new Date().toISOString(), level: "info", message: "Action", data: d }]);
    });
    sse.addEventListener("done", () => {
      sse.close();
    });

    // send initial POST to start server-side stream (fetch triggers server to stream)
    fetch("/api/lead-qualifier/stream", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {
      setLogs((l) => [...l, { ts: new Date().toISOString(), level: "error", message: "Failed to start stream" }]);
    });
  }

  useEffect(() => {
    return () => {
      evtSourceRef.current?.close();
    };
  }, []);

  return (
    <div className="glass p-4 rounded">
      <div className="flex gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="flex-1 rounded px-3 py-2 bg-white/5" />
        <button onClick={startStream} className="px-3 py-2 bg-cyan-600 rounded text-white">Run</button>
      </div>

      <div className="mt-3 text-sm">
        <div>Score: <strong>{score ?? "—"}</strong></div>
        <div>Action: <strong>{action ?? "—"}</strong></div>
      </div>

      <div className="mt-3 h-40 overflow-auto bg-black/40 p-2 text-xs rounded">
        <pre>{JSON.stringify(logs, null, 2)}</pre>
      </div>
    </div>
  );
}
