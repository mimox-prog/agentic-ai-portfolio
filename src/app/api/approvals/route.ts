export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const APPROVALS_FILE = path.join(DATA_DIR, "approvals.json");

function readJson(file: string) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return { requests: [] }; }
}
function writeJson(file: string, obj: any) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

export async function GET() {
  const approvals = readJson(APPROVALS_FILE);
  return NextResponse.json(approvals);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, action } = body as { id?: string; action?: "approve" | "reject" };
    if (!id || !action) return NextResponse.json({ error: "Missing id or action" }, { status: 400 });

    const approvals = readJson(APPROVALS_FILE);
    const reqItem = (approvals.requests || []).find((r: any) => r.id === id);
    if (!reqItem) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    reqItem.status = action === "approve" ? "approved" : "rejected";
    reqItem.resolvedAt = new Date().toISOString();
    writeJson(APPROVALS_FILE, approvals);

    return NextResponse.json({ ok: true, request: reqItem });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
