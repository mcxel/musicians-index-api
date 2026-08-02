/**
 * workflowRunStore — persist Living OS automation runs (localStorage).
 * Rule 20: only real runs recorded by the orchestrator — never seed fake history.
 */

import type { AssetRelationshipGraph } from "@/lib/livingOs/AssetRelationshipGraph";

export type WorkflowRunStatus = "Running" | "Completed" | "Failed" | "Retrying";

export type WorkflowStepStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED"
  | "QUEUED"
  | "RETRYING";

export interface WorkflowStepResult {
  stepId: string;
  label: string;
  status: WorkflowStepStatus;
  message?: string;
  /** Asset ids created/linked by this step (if any). */
  assetIds?: string[];
  startedAt?: string;
  finishedAt?: string;
  retryCount?: number;
}

export interface WorkflowRunRecord {
  runId: string;
  workflowId: string;
  releaseId?: string;
  performerId: string;
  status: WorkflowRunStatus;
  steps: WorkflowStepResult[];
  graph: AssetRelationshipGraph;
  startedAt: string;
  finishedAt?: string;
  errorSummary?: string;
}

const STORAGE_KEY = "tmi_living_os_workflow_runs";
const MAX_RUNS = 40;

function readAll(): WorkflowRunRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkflowRunRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(runs: WorkflowRunRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs.slice(0, MAX_RUNS)));
  } catch {
    /* quota */
  }
}

export function listWorkflowRuns(performerId?: string): WorkflowRunRecord[] {
  const all = readAll().sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
  if (!performerId) return all;
  return all.filter((r) => r.performerId === performerId);
}

export function getWorkflowRun(runId: string): WorkflowRunRecord | null {
  return readAll().find((r) => r.runId === runId) ?? null;
}

export function saveWorkflowRun(run: WorkflowRunRecord): WorkflowRunRecord {
  const all = readAll().filter((r) => r.runId !== run.runId);
  writeAll([run, ...all]);
  return run;
}

export function clearWorkflowRuns(performerId?: string): void {
  if (!performerId) {
    writeAll([]);
    return;
  }
  writeAll(readAll().filter((r) => r.performerId !== performerId));
}
