export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  const status = {
    pipelines: { build: "passed", test: "passed", deploy: "passed" },
    latencyMs: 2300,
    uptime: "99.97%",
    lastDeploy: new Date().toISOString(),
  };
  return NextResponse.json(status);
}
