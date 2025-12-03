// src/app/llm-summary/route.ts
export const runtime = "nodejs"; // ensure this route runs in Node, not Edge

import { NextResponse } from "next/server";
import { getDocs } from "@/lib/db";

export async function GET() {
  try {
    const docs = await getDocs();
    const lines = (docs || []).map((p: any) => {
      const title = p.title || p.slug || p.id || "Unnamed project";
      const domain = p.domain || "General";
      const short = (p.description || p.problem || "").replace(/\s+/g, " ").slice(0, 180);
      const tech = (p.tech || []).slice(0, 6).join(", ");
      const slug = p.slug || p.id || "";
      return `Project: ${title} | Domain: ${domain} | Summary: ${short} | Tech: ${tech} | URL: https://your-domain.com/projects/${slug}`;
    });
    const payload = lines.join("\n");
    return new NextResponse(payload, { headers: { "content-type": "text/plain; charset=utf-8" } });
  } catch (err) {
    return new NextResponse("error: failed to build summary", { status: 500 });
  }
}
