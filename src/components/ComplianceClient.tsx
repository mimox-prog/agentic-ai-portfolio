"use client";
import { useState } from "react";

export default function ComplianceClient() {
  const [file, setFile] = useState<File | null>(null);
  const [risks, setRisks] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/compliance-simulator", { method: "POST", body: fd });
    const data = await res.json();
    setRisks(data.risks || []);
    setLoading(false);
  }

  return (
    <div className="glass p-4 rounded">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit" disabled={!file || loading} className="px-3 py-2 bg-cyan-600 rounded text-white">{loading ? "Processing…" : "Process PDF"}</button>
      </form>

      {risks && (
        <div className="mt-3">
          <h4 className="font-semibold">Extracted risks</h4>
          <ul className="mt-2 text-sm">
            {risks.map((r, i) => (
              <li key={i} className="mb-2">
                <div className="font-medium">{r.section}</div>
                <div className="text-xs text-neutral-300">{r.snippet || r.risk}</div>
                <div className="text-xs text-neutral-400">Confidence: {(r.confidence || 0).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
