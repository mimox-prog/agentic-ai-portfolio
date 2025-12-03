// src/app/page.tsx
import type { Metadata } from "next";
import HeroStat from "@/components/HeroStat";
import ValueCard from "@/components/ValueCard";
import AgentGrid from "@/components/AgentGrid";

export const generateMetadata = async (): Promise<Metadata> => {
  const title = "Agentic AI Architect — Automation Systems That Scale | Marouan";
  const description =
    "I design autonomous agents and orchestration platforms that reduce costs by 70%, deliver 99.97% uptime, and integrate with enterprise stacks. Live demos and pilot offers.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://your-domain.com",
    },
  };
};

export default function HomePage() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-400 bg-clip-text text-transparent animate-gradient">
          Agentic AI Architect — Automation Systems That Scale With Compliance, Speed, and Trust
        </h1>

        <p className="mt-6 text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto">
          I design autonomous agents and orchestration platforms that reduce costs by 70%, deliver 99.97% uptime, and integrate seamlessly with your enterprise stack.
        </p>

        <div aria-label="Trust metrics" className="mt-10 inline-flex flex-wrap items-center justify-center gap-6 rounded-xl glass px-8 py-6">
          <HeroStat label="Deployments" value="3 Production Systems" />
          <HeroStat label="Uptime" value="99.97% SLA" />
          <HeroStat label="Latency" value="2.3s Avg Response" />
          <HeroStat label="ROI" value="70% Cost Savings" />
        </div>

        <div className="mt-12 flex justify-center gap-6">
          <a href="/demos" className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg">Try live demos</a>
          <a href="/contact" className="px-8 py-4 rounded-lg bg-white/10 border border-white/20 text-white font-semibold shadow-lg">Book a consultation</a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24">
        <AgentGrid />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 grid gap-6 md:grid-cols-2">
        <ValueCard title="Compliance automation" desc="RAG-powered agents that flag risks, generate reports, and cut review time from 40h → 4h." />
        <ValueCard title="Multi-agent orchestration" desc="LangGraph-based platforms coordinating agents with self-healing workflows and zero downtime." />
        <ValueCard title="Autonomous API integration" desc="Agents that discover, map, and maintain SaaS integrations automatically — eliminating 30h/week of manual work." />
        <ValueCard title="Enterprise-ready delivery" desc="Pilot in 7 days, scalable architecture, and transparent ROI metrics for technical buyers." />
      </div>
    </section>
  );
}
