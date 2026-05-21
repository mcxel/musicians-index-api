import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

type LegalStatus = "UNDER_REVIEW" | "ESCALATED" | "REPRESENTING" | "CLOSED_WITH_PROOF";

interface LegalCase {
  caseId: string;
  requesterModule: string;
  intakeType: string;
  summary: string;
  evidenceRefs: string[];
  jurisdiction?: string;
  status: LegalStatus;
  createdAt: number;
  updatedAt: number;
}

interface LegalEvent {
  eventId: string;
  caseId: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

const CASE_FILE = resolve(process.cwd(), "data", "legal-cases.json");
const EVENT_FILE = resolve(process.cwd(), "data", "legal-events.json");

async function readJsonArray<T>(path: string): Promise<T[]> {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeJsonArray(path: string, rows: unknown[]): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(rows, null, 2), "utf8");
}

async function appendEvent(caseId: string, type: string, payload: Record<string, unknown>): Promise<void> {
  const rows = await readJsonArray<LegalEvent>(EVENT_FILE);
  rows.push({
    eventId: randomUUID(),
    caseId,
    type,
    payload,
    timestamp: Date.now(),
  });
  await writeJsonArray(EVENT_FILE, rows);
}

export async function intakeLegalCase(input: {
  requesterModule: string;
  intakeType: string;
  summary: string;
  evidenceRefs: string[];
  jurisdiction?: string;
}): Promise<LegalCase> {
  const rows = await readJsonArray<LegalCase>(CASE_FILE);
  const now = Date.now();
  const row: LegalCase = {
    caseId: randomUUID(),
    requesterModule: input.requesterModule,
    intakeType: input.intakeType,
    summary: input.summary,
    evidenceRefs: input.evidenceRefs,
    jurisdiction: input.jurisdiction,
    status: "UNDER_REVIEW",
    createdAt: now,
    updatedAt: now,
  };

  rows.push(row);
  await writeJsonArray(CASE_FILE, rows);
  await appendEvent(row.caseId, "legal.intake", {
    intakeType: row.intakeType,
    requesterModule: row.requesterModule,
  });
  return row;
}

export async function updateLegalCase(
  caseId: string,
  input: {
    status?: LegalStatus;
    summaryAppend?: string;
    eventType: string;
    eventPayload?: Record<string, unknown>;
  }
): Promise<LegalCase | null> {
  const rows = await readJsonArray<LegalCase>(CASE_FILE);
  const index = rows.findIndex((row) => row.caseId === caseId);
  if (index < 0) {
    return null;
  }

  const current = rows[index];
  const next: LegalCase = {
    ...current,
    summary: input.summaryAppend ? `${current.summary}\n${input.summaryAppend}` : current.summary,
    status: input.status ?? current.status,
    updatedAt: Date.now(),
  };

  rows[index] = next;
  await writeJsonArray(CASE_FILE, rows);
  await appendEvent(caseId, input.eventType, {
    status: next.status,
    ...(input.eventPayload ?? {}),
  });
  return next;
}
