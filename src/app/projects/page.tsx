import AgentCard from "../../components/AgentCard";
import JsonLd from "../../components/JsonLd";
import type { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  const title = "Agentic AI Projects — RAG, Orchestration, Compliance | Marouan";
  const description = "Featured agentic AI projects: RAG Compliance Agent, Multi-Agent Collaboration, Autonomous API Integration. Live demos and pilot offers.";
  return {
    title,
    description,
    openGraph: { title, description, url: "https://your-domain.com/projects" },
  };
};

type Project = {
  title: string;
  domain: string;
  description: string;
  impact: string;
  status: "human-in-loop" | "autonomous" | "assistive";
  confidence: number;
};

const projects: Project[] = [
  {
    title: "RAG Compliance Agent Dashboard",
    domain: "Financial Services",
    description: "Real-time monitoring with human-in-loop approvals and audit trails.",
    impact: "Review time cut from 40h → 4h.",
    status: "human-in-loop",
    confidence: 0.82,
  },
  {
    title: "Supply Chain Multi-Agent Collaboration",
    domain: "Logistics",
    description: "Swarm coordination with orchestration visuals and agent messaging.",
    impact: "Optimized route planning and procurement signals.",
    status: "autonomous",
    confidence: 0.74,
  },
  {
    title: "Autonomous API Integration Agent",
    domain: "SaaS Ops",
    description: "Automatic OpenAPI spec generation and change management.",
    impact: "30h/week saved on manual maintenance.",
    status: "assistive",
    confidence: 0.88,
  },
];

export default function ProjectsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Agentic AI Projects",
    "description": "Featured agentic AI projects by Marouan",
    "itemListElement": projects.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": p.title,
      "description": p.description,
      "url": `https://your-domain.com/projects#${encodeURIComponent(p.title.replace(/\s+/g, "-").toLowerCase())}`
    }))
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <JsonLd data={jsonLd} />
      <h2 className="text-4xl font-extrabold tracking-tight">Featured Projects</h2>
      <p className="mt-6 text-neutral-300">Agentic UI patterns, governance controls, and orchestration flows.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {projects.map((p) => (
          <AgentCard key={p.title} {...p} />
        ))}
      </div>
    </section>
  );
}
