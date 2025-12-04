import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.LEAD_SERVICE_URL || 'http://localhost:8001/qualify';
  const r = await fetch(url, { method: 'POST', body: JSON.stringify(req.body), headers: { 'Content-Type': 'application/json' }});
  const data = await r.json();
  res.status(200).json(data);
}
