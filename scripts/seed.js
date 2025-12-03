// scripts/seed.js
const fs = require("fs");
const path = require("path");
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbFile = path.join(dataDir, "db.json");
const docs = [
  {
    id: "portfolio-agent",
    slug: "portfolio-agent",
    title: "Portfolio Agent",
    domain: "DevOps",
    description: "Agent that monitors repo, builds, tests, and deploys the portfolio.",
    tech: ["Node.js", "Next.js", "CI/CD"],
    tags: ["agentic ai", "orchestration"]
  },
  {
    id: "lead-qualifier",
    slug: "lead-qualifier",
    title: "Lead Qualifier Agent",
    domain: "Sales",
    description: "Enrichment and scoring agent for lead qualification.",
    tech: ["Node.js", "SSE"],
    tags: ["automation", "sales"]
  }
];
fs.writeFileSync(dbFile, JSON.stringify({ docs }, null, 2));
console.log("Seeded data/db.json");
