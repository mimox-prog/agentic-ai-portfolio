// apps/portfolio/pages/demos/lead.tsx
import React, { useState } from "react";

type Lead = { name?: string; email?: string; phone?: string; [k: string]: any };

export default function LeadDemo() {
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [leadsText, setLeadsText] = useState("Alice,a@x.com\nBob,b@x.com");

  async function runDemo() {
    setLoading(true);
    try {
      // parse simple CSV lines name,email
      const lines = leadsText.split("\n").map(l => l.trim()).filter(Boolean);
      const leads: Lead[] = lines.map(line => {
        const [name, email] = line.split(",").map(s => s && s.trim());
        return { name: name || "", email: email || "" };
      });

      const payload = { leads };
      const r = await fetch("/api/lead/qualify", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      const j = await r.json();
      setOut(j);
    } catch (err) {
      setOut({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function refreshLogs() {
    try {
      const r = await fetch("/api/lead/logs");
      const j = await r.json();
      setOut((prev: any) => ({ ...prev, logs: j.logs }));
    } catch (err) {
      setOut({ error: String(err) });
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Lead Qualifier Demo</h1>

      <section style={{ marginTop: 12 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Leads (CSV: name,email)</label>
        <textarea
          value={leadsText}
          onChange={(e) => setLeadsText(e.target.value)}
          rows={6}
          style={{ width: "100%", fontFamily: "monospace", padding: 8 }}
        />
      </section>

      <div style={{ marginTop: 12 }}>
        <button onClick={runDemo} disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "Running…" : "Run demo"}
        </button>
        <button onClick={refreshLogs} style={{ marginLeft: 8, padding: "8px 12px" }}>
          Refresh logs
        </button>
      </div>

      <section style={{ marginTop: 16 }}>
        <h2>Result</h2>
        <pre style={{ background: "#f6f8fa", padding: 12, maxHeight: 420, overflow: "auto" }}>
          {JSON.stringify(out, null, 2)}
        </pre>
      </section>
    </main>
  );
}
