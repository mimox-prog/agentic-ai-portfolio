export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { findDocBySlug } from "@/lib/db";
import { runPipeline } from "@/lib/orchestrator";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = body?.slug || "portfolio-agent";
    const project = await findDocBySlug(slug);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // run pipeline and collect logs
    const logs = await runPipeline(project);
    // compute simple status
    const failed = logs.some((l) => l.status === "failed");
    const status = failed ? "degraded" : "healthy";

    return NextResponse.json({
      status,
      lastRun: new Date().toISOString(),
      logs,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
