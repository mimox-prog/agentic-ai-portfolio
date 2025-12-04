// apps/portfolio/pages/api/lead/logs.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = process.env.LEAD_SERVICE_URL || "http://localhost:8001/logs";
    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: "Upstream error", detail: text });
    }
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: "proxy_failed", message: err.message || String(err) });
  }
}
