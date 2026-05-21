import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export interface WorkforceHookRequest {
  hookId: string;
  requestType: "cleanup" | "repair" | "emergency" | "event_staff";
  crowdPhase: "pre-show" | "group-round" | "finale";
  workerCount: number;
  urgency: "normal" | "high" | "critical";
  notes?: string;
  status: "REQUESTED" | "DISPATCHED";
  timestamp: number;
}

const HOOK_FILE = resolve(process.cwd(), "data", "workforce-hooks.json");

async function readHooks(): Promise<WorkforceHookRequest[]> {
  try {
    const raw = await readFile(HOOK_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as WorkforceHookRequest[]) : [];
  } catch {
    return [];
  }
}

async function writeHooks(rows: WorkforceHookRequest[]): Promise<void> {
  await mkdir(dirname(HOOK_FILE), { recursive: true });
  await writeFile(HOOK_FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function createWorkforceHook(input: {
  requestType: "cleanup" | "repair" | "emergency" | "event_staff";
  crowdPhase: "pre-show" | "group-round" | "finale";
  workerCount: number;
  urgency: "normal" | "high" | "critical";
  notes?: string;
}): Promise<WorkforceHookRequest> {
  const rows = await readHooks();
  const row: WorkforceHookRequest = {
    hookId: randomUUID(),
    requestType: input.requestType,
    crowdPhase: input.crowdPhase,
    workerCount: input.workerCount,
    urgency: input.urgency,
    notes: input.notes,
    status: "REQUESTED",
    timestamp: Date.now(),
  };
  rows.push(row);
  await writeHooks(rows);
  return row;
}
