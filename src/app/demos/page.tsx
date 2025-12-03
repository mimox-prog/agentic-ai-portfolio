// src/app/demos/page.tsx
import React from "react";
import LeadQualifierClient from "@/components/LeadQualifierClient";
import PortfolioAgentClient from "@/components/PortfolioAgentClient";
import ComplianceClient from "@/components/ComplianceClient";
import AgentConsoleClient from "@/components/AgentConsoleClient";
import ApprovalsClient from "@/components/ApprovalsClient";

export const metadata = {
  title: "Demos — Agentic AI",
  description: "Live agentic demos: pipeline orchestration, streaming lead qualifier, compliance RAG simulator, and approvals.",
};

export default function DemosPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Live Demo Hub</h1>
      <p className="mt-2 text-neutral-300">Run autonomous workflows, inspect traces, and approve sensitive actions.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="glass rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold">Lead Qualifier Agent</div>
              <div className="text-sm text-neutral-400 mt-1">Streaming enrichment, scoring, and action recommendation.</div>
            </div>
          </div>
          <div className="mt-4">
            <LeadQualifierClient />
          </div>
        </div>

        <div className="glass rounded-lg p-6">
          <div className="text-xl font-semibold">Portfolio Agent</div>
          <div className="text-sm text-neutral-400 mt-1">Run the build/test/deploy pipeline and view telemetry.</div>
          <div className="mt-4">
            <PortfolioAgentClient slug="portfolio-agent" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-1">
        <div className="glass rounded-lg p-6">
          <div className="text-xl font-semibold">Compliance Simulator</div>
          <div className="text-sm text-neutral-400 mt-1">Upload a PDF to extract risk snippets using local semantic search.</div>
          <div className="mt-4">
            <ComplianceClient />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="glass rounded-lg p-6">
          <div className="text-xl font-semibold">Agent Console</div>
          <div className="text-sm text-neutral-400 mt-1">View running agents, logs, and control them.</div>
          <div className="mt-4">
            <AgentConsoleClient />
          </div>
        </div>

        <div className="glass rounded-lg p-6">
          <div className="text-xl font-semibold">Approvals</div>
          <div className="text-sm text-neutral-400 mt-1">Approve or reject agent actions that require human consent.</div>
          <div className="mt-4">
            <ApprovalsClient />
          </div>
        </div>
      </div>

      <div className="mt-10 text-xs text-neutral-400">
        <div>Tip: open your browser DevTools Network tab to watch SSE events and API calls in real time.</div>
      </div>
    </section>
  );
}
