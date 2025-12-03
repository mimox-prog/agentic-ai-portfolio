// src/app/api/lead-qualifier/stream/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

function sseEvent(event: string, data: any) {
  return `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(new TextEncoder().encode(sseEvent("log", { ts: new Date().toISOString(), level: "info", message: "Received input" })));
        await new Promise((r) => setTimeout(r, 400));

        controller.enqueue(new TextEncoder().encode(sseEvent("log", { ts: new Date().toISOString(), level: "info", message: "Enriching profile (demo)" })));
        await new Promise((r) => setTimeout(r, 800));
        const domain = (email || "demo@company.com").split("@")[1] || "unknown";
        controller.enqueue(new TextEncoder().encode(sseEvent("enrichment", { domain, companySize: "50-200", industry: "SaaS" })));

        await new Promise((r) => setTimeout(r, 600));
        const score = Math.min(100, Math.round((email || "demo@company.com").length * 3 + (domain.includes("inc") ? 5 : 0)));
        controller.enqueue(new TextEncoder().encode(sseEvent("score", { score })));

        await new Promise((r) => setTimeout(r, 400));
        const action = score > 60 ? "book_call" : "nurture_sequence";
        controller.enqueue(new TextEncoder().encode(sseEvent("action", { action, message: action === "book_call" ? "Recommend 30-min deep-dive" : "Add to nurture drip" })));

        controller.enqueue(new TextEncoder().encode(sseEvent("done", { ts: new Date().toISOString() })));
        controller.close();
      } catch (err) {
        controller.enqueue(new TextEncoder().encode(sseEvent("error", { message: String(err) })));
        controller.close();
      }
    },
  });

  return new NextResponse(stream, { headers: sseHeaders() });
}
