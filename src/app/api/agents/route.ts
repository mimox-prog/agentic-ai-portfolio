// src/app/api/agents/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const AGENTS_FILE = path.join(DATA_DIR, "agents.json");
const LOG_FILE = path.join(DATA_DIR, "agent-logs.json");

function readJson(file: string) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

export async function GET() {
  const agents = readJson(AGENTS_FILE) || { agents: [] };
  const logs = readJson(LOG_FILE) || { logs: [] };
  return NextResponse.json({ agents: agents.agents || [], logs: logs.logs || [] });
}
