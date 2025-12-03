// src/lib/planner.ts
// Planner interface and two implementations: LocalPlanner (deterministic) and a stub OpenAIPlanner.
// The LocalPlanner returns structured plans with steps, rationales and optional requiresApproval flags.
// The OpenAIPlanner is a placeholder showing where to integrate a cloud LLM.

export type PlanStep = {
  id: string;
  action: string;
  args?: Record<string, any>;
  requiresApproval?: boolean;
  rationale?: string;
  evidence?: { id: string; snippet: string }[];
};

export type Plan = {
  planId: string;
  projectId?: string;
  steps: PlanStep[];
  summary: string;
  confidence?: number;
  createdAt?: string;
};

export interface Planner {
  planForProject(project: any): Promise<Plan>;
}

/**
 * LocalPlanner
 * - Deterministic, explainable planner for local development and demos.
 * - Detects keywords in project title/description and emits a small plan.
 * - Marks deploy steps as requiring approval by default.
 */
export class LocalPlanner implements Planner {
  constructor(private opts?: { requireApprovalForDeploy?: boolean }) {
    if (!this.opts) this.opts = { requireApprovalForDeploy: true };
  }

  private nowId(prefix = "plan") {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  async planForProject(project: any): Promise<Plan> {
    const title = (project?.title || "").toString();
    const desc = (project?.description || "").toString();
    const text = `${title} ${desc}`.toLowerCase();

    const steps: PlanStep[] = [];
    // Basic heuristics
    if (/deploy|pipeline|build|ci|release/i.test(text)) {
      steps.push({
        id: "monitor",
        action: "monitor-repo",
        rationale: "Start by checking repository status and recent commits",
      });
      steps.push({
        id: "build",
        action: "run-build",
        rationale: "Build artifacts to ensure compilation and packaging succeed",
      });
      steps.push({
        id: "test",
        action: "run-tests",
        rationale: "Run unit and integration tests to validate behavior",
      });
      steps.push({
        id: "deploy",
        action: "deploy-to-staging",
        requiresApproval: !!this.opts?.requireApprovalForDeploy,
        rationale: "Deploy to staging for smoke tests; requires approval for production deploys",
      });
      steps.push({
        id: "post-deploy-check",
        action: "post-deploy-checks",
        rationale: "Run health checks and basic smoke tests after deploy",
      });
    } else if (/audit|compliance|policy|risk/i.test(text)) {
      steps.push({
        id: "ingest",
        action: "ingest-docs",
        rationale: "Collect relevant documents for compliance analysis",
      });
      steps.push({
        id: "rag",
        action: "run-rag-check",
        rationale: "Run retrieval-augmented checks for policy violations",
      });
      steps.push({
        id: "report",
        action: "generate-report",
        rationale: "Generate a compliance report for review",
      });
    } else {
      steps.push({
        id: "noop",
        action: "noop",
        rationale: "No automated actions detected; monitor for changes",
      });
    }

    const plan: Plan = {
      planId: this.nowId("local"),
      projectId: project?.id || project?.slug || null,
      steps,
      summary: `Deterministic plan for ${project?.title || project?.slug || "project"}`,
      confidence: 0.6,
      createdAt: new Date().toISOString(),
    };

    return plan;
  }
}

/**
 * OpenAIPlanner (stub)
 * - Example structure for integrating a cloud LLM.
 * - Implementers should call the LLM with a prompt that requests a JSON plan and parse the response.
 * - Keep the output strictly JSON to avoid parsing issues.
 */
export class OpenAIPlanner implements Planner {
  constructor(private apiKey: string) {}

  async planForProject(project: any): Promise<Plan> {
    // This is a stub. Replace with your OpenAI/Azure OpenAI call.
    // Example approach:
    // 1. Build a prompt describing the project and required output schema (Plan JSON).
    // 2. Call the LLM (chat/completions).
    // 3. Parse the JSON safely and validate fields.
    // 4. Return the Plan object.

    // For safety in this repo, we return a simple fallback plan.
    return {
      planId: `openai-fallback-${Date.now()}`,
      projectId: project?.id || project?.slug || null,
      steps: [
        { id: "analyze", action: "analyze-project", rationale: "Fallback analysis step" },
        { id: "noop", action: "noop", rationale: "Fallback noop" },
      ],
      summary: "Fallback plan from OpenAIPlanner (not implemented)",
      confidence: 0.4,
      createdAt: new Date().toISOString(),
    };
  }
}
