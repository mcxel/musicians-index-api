import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

type SecurityStatus =
  | "DETECTED"
  | "QUARANTINED"
  | "ISOLATED"
  | "SECRETS_ROTATED"
  | "RECOVERED"
  | "FORENSICS_CAPTURED";

interface SecurityIncident {
  incidentId: string;
  moduleId: string;
  severity: "low" | "medium" | "high" | "critical";
  status: SecurityStatus;
  summary: string;
  createdAt: number;
  updatedAt: number;
}

interface SecurityAction {
  actionId: string;
  incidentId: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

const INCIDENT_FILE = resolve(process.cwd(), "data", "security-incidents.json");
const ACTION_FILE = resolve(process.cwd(), "data", "security-actions.json");

async function readJsonArray<T>(filePath: string): Promise<T[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeJsonArray(filePath: string, rows: unknown[]): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(rows, null, 2), "utf8");
}

async function appendAction(incidentId: string, type: string, payload: Record<string, unknown>): Promise<void> {
  const rows = await readJsonArray<SecurityAction>(ACTION_FILE);
  rows.push({
    actionId: randomUUID(),
    incidentId,
    type,
    payload,
    timestamp: Date.now(),
  });
  await writeJsonArray(ACTION_FILE, rows);
}

export async function createIncident(input: {
  moduleId: string;
  severity: "low" | "medium" | "high" | "critical";
  summary: string;
}): Promise<SecurityIncident> {
  const rows = await readJsonArray<SecurityIncident>(INCIDENT_FILE);
  const now = Date.now();
  const row: SecurityIncident = {
    incidentId: randomUUID(),
    moduleId: input.moduleId,
    severity: input.severity,
    status: "DETECTED",
    summary: input.summary,
    createdAt: now,
    updatedAt: now,
  };
  rows.push(row);
  await writeJsonArray(INCIDENT_FILE, rows);
  await appendAction(row.incidentId, "security.detected", {
    moduleId: row.moduleId,
    severity: row.severity,
  });
  return row;
}

export async function transitionIncident(
  incidentId: string,
  input: {
    status: SecurityStatus;
    actionType: string;
    payload?: Record<string, unknown>;
  }
): Promise<SecurityIncident | null> {
  const rows = await readJsonArray<SecurityIncident>(INCIDENT_FILE);
  const index = rows.findIndex((row) => row.incidentId === incidentId);
  if (index < 0) {
    return null;
  }

  const current = rows[index];
  const next: SecurityIncident = {
    ...current,
    status: input.status,
    updatedAt: Date.now(),
  };
  rows[index] = next;
  await writeJsonArray(INCIDENT_FILE, rows);
  await appendAction(incidentId, input.actionType, {
    status: input.status,
    ...(input.payload ?? {}),
  });
  return next;
}
