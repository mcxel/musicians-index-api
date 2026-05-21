import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export type DispatchStatus =
  | "CREATED"
  | "ASSIGNED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED_ESCALATED";

export interface DispatchRecord {
  requestId: string;
  requesterModule: string;
  requestType: string;
  workerQuantityMode: string;
  workerTypes: string[];
  workerCount: number;
  location: string;
  urgency: string;
  notes?: string;
  assignedWorkers: string[];
  status: DispatchStatus;
  createdAt: number;
  updatedAt: number;
}

interface DispatchEvent {
  eventId: string;
  requestId: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

const DISPATCH_FILE = resolve(process.cwd(), "data", "dispatch-records.json");
const EVENT_FILE = resolve(process.cwd(), "data", "dispatch-events.json");

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

async function appendEvent(requestId: string, type: string, payload: Record<string, unknown>): Promise<void> {
  const rows = await readJsonArray<DispatchEvent>(EVENT_FILE);
  rows.push({
    eventId: randomUUID(),
    requestId,
    type,
    payload,
    timestamp: Date.now(),
  });
  await writeJsonArray(EVENT_FILE, rows);
}

export async function createDispatch(input: {
  requesterModule: string;
  requestType: string;
  workerQuantityMode: string;
  workerTypes: string[];
  workerCount: number;
  location: string;
  urgency: string;
  notes?: string;
}): Promise<DispatchRecord> {
  const rows = await readJsonArray<DispatchRecord>(DISPATCH_FILE);
  const now = Date.now();
  const row: DispatchRecord = {
    requestId: randomUUID(),
    requesterModule: input.requesterModule,
    requestType: input.requestType,
    workerQuantityMode: input.workerQuantityMode,
    workerTypes: input.workerTypes,
    workerCount: input.workerCount,
    location: input.location,
    urgency: input.urgency,
    notes: input.notes,
    assignedWorkers: [],
    status: "CREATED",
    createdAt: now,
    updatedAt: now,
  };

  rows.push(row);
  await writeJsonArray(DISPATCH_FILE, rows);
  await appendEvent(row.requestId, "willdoit.dispatch.created", {
    requesterModule: row.requesterModule,
    requestType: row.requestType,
    workerCount: row.workerCount,
  });
  return row;
}

export async function updateDispatch(
  requestId: string,
  update: {
    status: DispatchStatus;
    assignedWorkers?: string[];
    notes?: string;
    eventType: string;
    eventPayload?: Record<string, unknown>;
  }
): Promise<DispatchRecord | null> {
  const rows = await readJsonArray<DispatchRecord>(DISPATCH_FILE);
  const index = rows.findIndex((row) => row.requestId === requestId);
  if (index < 0) {
    return null;
  }

  const current = rows[index];
  const next: DispatchRecord = {
    ...current,
    status: update.status,
    assignedWorkers: update.assignedWorkers ?? current.assignedWorkers,
    notes: update.notes ?? current.notes,
    updatedAt: Date.now(),
  };

  rows[index] = next;
  await writeJsonArray(DISPATCH_FILE, rows);
  await appendEvent(requestId, update.eventType, {
    status: update.status,
    ...(update.eventPayload ?? {}),
  });

  return next;
}

export async function getDispatch(requestId: string): Promise<DispatchRecord | null> {
  const rows = await readJsonArray<DispatchRecord>(DISPATCH_FILE);
  return rows.find((row) => row.requestId === requestId) ?? null;
}
