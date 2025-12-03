// src/lib/orchestrator.ts
import type { Project } from "@/lib/db";

export type StepLog = { ts: string; step: string; status: "pending" | "running" | "passed" | "failed"; message?: string };

export async function runPipeline(project: Project, onLog?: (log: StepLog) => void) {
  const steps = [
    { name: "git-monitor", duration: 600 },
    { name: "build", duration: 1200 },
    { name: "test", duration: 900 },
    { name: "deploy", duration: 800 },
    { name: "post-deploy-check", duration: 400 },
  ];

  const logs: StepLog[] = [];

  const push = (step: string, status: StepLog["status"], message?: string) => {
    const l = { ts: new Date().toISOString(), step, status, message };
    logs.push(l);
    if (onLog) onLog(l);
  };

  for (const s of steps) {
    push(s.name, "pending");
  }

  for (const s of steps) {
    push(s.name, "running", `Starting ${s.name}`);
    // simulate work
    await new Promise((r) => setTimeout(r, s.duration));
    // deterministic pass/fail heuristic: build fails if title contains "fail"
    const failed = s.name === "build" && (project.title || "").toLowerCase().includes("fail");
    if (failed) {
      push(s.name, "failed", `${s.name} failed due to build error (simulated)`);
      // mark remaining as pending->failed
      for (const rem of steps.slice(steps.indexOf(s) + 1)) push(rem.name, "failed", "skipped due to earlier failure");
      break;
    } else {
      push(s.name, "passed", `${s.name} completed`);
    }
  }

  return logs;
}
