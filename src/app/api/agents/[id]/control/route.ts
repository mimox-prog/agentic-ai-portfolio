// src/app/api/agents/[id]/control/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const AGENTS_FILE = path.join(DATA_DIR, "agents.json");

function readJson(file: string) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}
function writeJson(file: string, obj: any) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

/**
 * POST handler to control an agent.
 * Accepts context.params as either a Promise or an object (handles both shapes).
 * Body: { action: "enable" | "disable" | "setInterval", intervalSec?: number }
 */
export async function POST(request: Request, context: any) {
  try {
    // Next may pass context.params as a Promise or as an object; handle both.
    const rawParams = context?.params;
    const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Missing agent id in route params" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body?.action;

    const agentsData = readJson(AGENTS_FILE) || { agents: [] };
    const agent = (agentsData.agents || []).find((a: any) => a.id === id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (action === "enable") agent.enabled = true;
    else if (action === "disable") agent.enabled = false;
    else if (action === "setInterval" && typeof body.intervalSec === "number") agent.intervalSec = body.intervalSec;
    else if (!action) {
      return NextResponse.json({ error: "Missing action in request body" }, { status: 400 });
    }

    writeJson(AGENTS_FILE, agentsData);
    return NextResponse.json({ ok: true, agent });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
