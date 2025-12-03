// scripts/agent-runner.js
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const AGENTS_FILE = path.join(DATA_DIR, "agents.json");
const LOG_FILE = path.join(DATA_DIR, "agent-logs.json");
const APPROVALS_FILE = path.join(DATA_DIR, "approvals.json");
const LAST_CHANGE_FILE = path.join(DATA_DIR, ".approvals-last-change");

// Sweep interval (ms). The runner also wakes immediately when approvals change.
const SWEEP_MS = 10000;

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ docs: [] }, null, 2));
  if (!fs.existsSync(AGENTS_FILE)) {
    fs.writeFileSync(
      AGENTS_FILE,
      JSON.stringify(
        {
          agents: [
            {
              id: "autonomy-1",
              name: "Portfolio Orchestrator",
              enabled: true,
              intervalSec: Math.floor(SWEEP_MS / 1000),
              lastRun: null,
              status: "idle",
            },
          ],
        },
        null,
        2
      )
    );
  }
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, JSON.stringify({ logs: [] }, null, 2));
  if (!fs.existsSync(APPROVALS_FILE)) fs.writeFileSync(APPROVALS_FILE, JSON.stringify({ requests: [] }, null, 2));
  // ensure last-change file exists
  try {
    if (!fs.existsSync(LAST_CHANGE_FILE)) fs.writeFileSync(LAST_CHANGE_FILE, "");
  } catch (e) {}
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return null;
  }
}
function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

function appendLog(entry) {
  const all = readJson(LOG_FILE) || { logs: [] };
  all.logs.unshift(entry);
  all.logs = all.logs.slice(0, 1000);
  writeJson(LOG_FILE, all);
  console.log(`[AGENT LOG] ${entry.ts} ${entry.agentId} ${entry.level} ${entry.message}`);
}

/* Helpers to avoid duplicate approvals and resume approved ones */
function hasPendingApprovalForProject(projectId) {
  const approvals = readJson(APPROVALS_FILE) || { requests: [] };
  return (approvals.requests || []).some((r) => r.projectId === projectId && r.status === "pending");
}

function getApprovedRequests() {
  const approvals = readJson(APPROVALS_FILE) || { requests: [] };
  return (approvals.requests || []).filter((r) => r.status === "approved" && !r.resumed);
}

function markRequestResumed(reqId) {
  const approvals = readJson(APPROVALS_FILE) || { requests: [] };
  const item = approvals.requests.find((r) => r.id === reqId);
  if (item) {
    item.resumed = true;
    item.resumedAt = new Date().toISOString();
    writeJson(APPROVALS_FILE, approvals);
  }
}

/* LocalPlanner (deterministic) */
function nowId(prefix = "plan") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
function localPlanForProject(project) {
  const title = (project && project.title) ? String(project.title) : "";
  const desc = (project && project.description) ? String(project.description) : "";
  const text = `${title} ${desc}`.toLowerCase();

  const steps = [];
  if (/deploy|pipeline|build|ci|release/i.test(text)) {
    steps.push({ id: "monitor", action: "monitor-repo", rationale: "Check repo status" });
    steps.push({ id: "build", action: "run-build", rationale: "Build artifacts" });
    steps.push({ id: "test", action: "run-tests", rationale: "Run tests" });
    steps.push({ id: "deploy", action: "deploy-to-staging", requiresApproval: true, rationale: "Deploy requires approval" });
    steps.push({ id: "post-deploy-check", action: "post-deploy-checks", rationale: "Smoke tests" });
  } else if (/audit|compliance|policy|risk/i.test(text)) {
    steps.push({ id: "ingest", action: "ingest-docs", rationale: "Collect docs" });
    steps.push({ id: "rag", action: "run-rag-check", rationale: "RAG checks" });
    steps.push({ id: "report", action: "generate-report", rationale: "Create report" });
  } else {
    steps.push({ id: "noop", action: "noop", rationale: "No action" });
  }

  return {
    planId: nowId("local"),
    projectId: project && (project.id || project.slug) ? (project.id || project.slug) : null,
    steps,
    summary: `Deterministic plan for ${project && (project.title || project.slug) ? (project.title || project.slug) : "project"}`,
    confidence: 0.6,
    createdAt: new Date().toISOString(),
  };
}

/* Simulate step execution */
async function simulateStepExecution(step, project) {
  const baseMs = 300;
  const duration = baseMs + (String(step.action).length % 5) * 200;
  const start = Date.now();
  while (Date.now() - start < duration) {
    await new Promise((r) => setTimeout(r, 20));
  }
  const failed = (project && String(project.title || "").toLowerCase().includes("fail") && String(step.action).includes("build"));
  return { ok: !failed, detail: failed ? "Simulated build failure" : "ok" };
}

async function handlePlan(agentId, plan, project) {
  // avoid noisy logs for noop-only plans
  if (!(plan.steps.length === 1 && plan.steps[0].action === "noop")) {
    appendLog({ ts: new Date().toISOString(), agentId, level: "info", message: `Plan created ${plan.planId}`, meta: plan });
  }

  for (const step of plan.steps) {
    if (step.requiresApproval) {
      const approvals = readJson(APPROVALS_FILE) || { requests: [] };
      const reqId = `${plan.planId}-${step.id}`;
      const existing = approvals.requests.find((r) => r.id === reqId);
      if (!existing) {
        approvals.requests.unshift({
          id: reqId,
          projectId: plan.projectId,
          planId: plan.planId,
          step,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
        writeJson(APPROVALS_FILE, approvals);
        // touch last-change so watcher/wake logic notices
        try { fs.writeFileSync(LAST_CHANGE_FILE, new Date().toISOString()); } catch (e) {}
        appendLog({ ts: new Date().toISOString(), agentId, level: "warn", message: `Approval requested for step ${step.action}`, meta: { requestId: reqId } });
      } else {
        appendLog({ ts: new Date().toISOString(), agentId, level: "info", message: `Approval exists for ${step.action} (status=${existing.status})`, meta: { requestId: existing.id, status: existing.status } });
      }
      return;
    } else {
      appendLog({ ts: new Date().toISOString(), agentId, level: "info", message: `Executing step ${step.action}` });
      const result = await simulateStepExecution(step, project);
      appendLog({ ts: new Date().toISOString(), agentId, level: result.ok ? "info" : "error", message: `Step ${step.action} ${result.ok ? "succeeded" : "failed"}`, meta: { detail: result.detail } });
      if (!result.ok) {
        appendLog({ ts: new Date().toISOString(), agentId, level: "warn", message: `Escalation: step ${step.action} failed for project ${plan.projectId}` });
        return;
      }
    }
  }

  appendLog({ ts: new Date().toISOString(), agentId, level: "info", message: `Plan ${plan.planId} completed` });
}

/* Runner cycle */
async function runAgentCycle(agent) {
  const ts = new Date().toISOString();
  appendLog({ ts, agentId: agent.id, level: "info", message: `Agent cycle started` });

  // First: resume any approved requests immediately
  const approved = getApprovedRequests();
  for (const req of approved) {
    appendLog({ ts: new Date().toISOString(), agentId: agent.id, level: "info", message: `Resuming approved request ${req.id}` });
    const step = req.step;
    const project = { id: req.projectId, title: req.projectId };
    const result = await simulateStepExecution(step, project);
    appendLog({ ts: new Date().toISOString(), agentId: agent.id, level: result.ok ? "info" : "error", message: `Resumed step ${step.action} ${result.ok ? "succeeded" : "failed"}`, meta: { detail: result.detail } });
    markRequestResumed(req.id);
  }

  const db = readJson(DB_FILE) || { docs: [] };
  const projects = db.docs || [];

  for (const p of projects) {
    const projectId = p.id || p.slug || p.title;
    // Skip planning if a pending approval exists for this project
    if (hasPendingApprovalForProject(projectId)) {
      appendLog({ ts: new Date().toISOString(), agentId: agent.id, level: "info", message: `Skipping ${projectId} because pending approval exists` });
      continue;
    }

    appendLog({ ts: new Date().toISOString(), agentId: agent.id, level: "info", message: `Evaluating project ${p.slug || p.id || p.title}` });
    try {
      const plan = localPlanForProject(p);
      plan.projectId = p.id || p.slug || p.title;
      await handlePlan(agent.id, plan, p);
    } catch (err) {
      appendLog({ ts: new Date().toISOString(), agentId: agent.id, level: "error", message: `Planner error: ${String(err)}` });
    }
  }
}

/* File watcher to wake the main loop when approvals change */
function startApprovalsWatcher() {
  try {
    fs.watch(APPROVALS_FILE, { persistent: false }, () => {
      try {
        fs.writeFileSync(LAST_CHANGE_FILE, new Date().toISOString());
      } catch (e) {}
    });
  } catch (e) {
    // ignore watcher errors on platforms that don't support fs.watch reliably
  }
}

/* Wait helper that wakes early if approvals changed */
function waitWithWake(ms, lastSeenRef) {
  return new Promise((resolve) => {
    const start = Date.now();
    const checkInterval = 250;
    const t = setInterval(() => {
      try {
        const cur = fs.existsSync(LAST_CHANGE_FILE) ? fs.readFileSync(LAST_CHANGE_FILE, "utf8") : "";
        if (cur && cur !== lastSeenRef.value) {
          lastSeenRef.value = cur;
          clearInterval(t);
          resolve();
        } else if (Date.now() - start >= ms) {
          clearInterval(t);
          resolve();
        }
      } catch (e) {
        // ignore read errors
      }
    }, checkInterval);
  });
}

async function main() {
  ensureFiles();
  startApprovalsWatcher();
  appendLog({ ts: new Date().toISOString(), agentId: "system", level: "info", message: "Agent runner started" });

  const agentsData = readJson(AGENTS_FILE) || { agents: [] };
  const lastSeenRef = { value: fs.existsSync(LAST_CHANGE_FILE) ? fs.readFileSync(LAST_CHANGE_FILE, "utf8") : "" };

  while (true) {
    const agentsDataNow = readJson(AGENTS_FILE) || { agents: [] };
    for (const agent of agentsDataNow.agents || []) {
      if (!agent.enabled) continue;
      try {
        await runAgentCycle(agent);
        agent.lastRun = new Date().toISOString();
        agent.status = "idle";
      } catch (err) {
        appendLog({ ts: new Date().toISOString(), agentId: agent.id, level: "error", message: `Agent error: ${String(err)}` });
        agent.status = "error";
      }
      writeJson(AGENTS_FILE, agentsDataNow);
    }

    // wait but wake early if approvals changed
    await waitWithWake(SWEEP_MS, lastSeenRef);
  }
}

main().catch((e) => {
  console.error("Agent runner failed:", e);
  process.exit(1);
});
