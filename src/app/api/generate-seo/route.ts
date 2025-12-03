// src/app/api/generate-seo/route.ts
export const runtime = "nodejs"; // run this API in Node so we can use fs/path and local DB

import { NextRequest, NextResponse } from "next/server";
import { getDocs } from "@/lib/db";

type SeoResult = {
  title: string;
  description: string;
  keywords: string[];
  jsonLd: Record<string, any>;
};

function truncateSmart(text: string, max = 160) {
  if (!text) return "";
  if (text.length <= max) return text;
  const truncated = text.slice(0, max - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  return truncated.slice(0, lastSpace > 0 ? lastSpace : max - 1) + "…";
}

function buildTitle(project: any) {
  const base = project?.title || "Agentic AI Project";
  const domain = project?.domain ? ` — ${project.domain}` : "";
  const suffix = " | Agentic AI Architect";
  const raw = `${base}${domain}${suffix}`;
  if (raw.length <= 60) return raw;
  const shortBase = base.split(" ").slice(0, 6).join(" ");
  const candidate = `${shortBase}${domain}${suffix}`;
  return candidate.length <= 60 ? candidate : truncateSmart(candidate, 60);
}

function buildDescription(project: any) {
  const problem = project?.problem || project?.description || "Agentic AI solution";
  const impact = project?.impact ? `Impact: ${project.impact}.` : "";
  const tech = project?.tech ? `Built with ${project.tech.join(", ")}.` : "";
  const raw = `${problem} ${impact} ${tech} Pilot available in 7 days.`;
  return truncateSmart(raw.trim(), 160);
}

function buildKeywords(project: any) {
  const keywords = new Set<string>();
  const add = (s?: string) => {
    if (!s) return;
    s
      .split(/[,/|]+|\s+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 6)
      .forEach((k) => keywords.add(k));
  };

  add(project?.title);
  add(project?.domain);
  add(project?.tech?.join(" "));
  add(project?.tags?.join(" "));
  ["agentic ai", "automation", "orchestration", "RAG", "human-in-loop", "enterprise automation"].forEach((t) =>
    keywords.add(t)
  );

  return Array.from(keywords).slice(0, 12);
}

function buildJsonLd(project: any) {
  const name = project?.title || "Agentic AI Project";
  const description = truncateSmart(project?.description || project?.problem || "", 200);
  const url = project?.url || `https://your-domain.com/projects/${project?.slug || ""}`;
  const tech = project?.tech || [];
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name,
    description,
    url,
    programmingLanguage: tech,
    keywords: buildKeywords(project),
  };
  if (project?.repo) jsonLd.codeRepository = project.repo;
  return jsonLd;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = body?.projectId || body?.slug || null;

    const docs = await getDocs();
    const project = projectId ? docs.find((d: any) => d.id === projectId || d.slug === projectId) : null;

    if (projectId && !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const seedProject = project || {
      title: "Agentic AI Architect",
      domain: "Enterprise Automation",
      description:
        "Agentic AI systems, orchestration platforms, and compliance automation. Pilot in 7 days. Contact for enterprise engagements.",
      tech: ["Next.js", "TypeScript", "RAG"],
      tags: ["agentic ai", "automation", "orchestration"],
      slug: "",
      repo: "",
    };

    const title = buildTitle(seedProject);
    const description = buildDescription(seedProject);
    const keywords = buildKeywords(seedProject);
    const jsonLd = buildJsonLd(seedProject);

    const result: SeoResult = { title, description, keywords, jsonLd };

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate SEO", details: String(err) }, { status: 500 });
  }
}
