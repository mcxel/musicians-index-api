import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

type WorkforceStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "FUNDED" | "REIMBURSED";

export interface WorkforceFundingRequest {
  requestId: string;
  requesterModule: string;
  requesterPerson: string;
  requestType: string;
  accountingCategory: string;
  fundingSource: string;
  workerCount: number;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  notes?: string;
  status: WorkforceStatus;
  createdAt: number;
  updatedAt: number;
}

interface WorkforceLedgerEntry {
  ledgerId: string;
  requestId: string;
  action: "REQUEST" | "APPROVE" | "REJECT" | "FUND" | "REIMBURSE";
  amount: number;
  fundingSource: string;
  note?: string;
  timestamp: number;
}

const REQUEST_FILE = resolve(process.cwd(), "data", "workforce-requests.json");
const LEDGER_FILE = resolve(process.cwd(), "data", "workforce-ledger.json");

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

async function appendLedger(input: {
  requestId: string;
  action: WorkforceLedgerEntry["action"];
  amount: number;
  fundingSource: string;
  note?: string;
}): Promise<void> {
  const rows = await readJsonArray<WorkforceLedgerEntry>(LEDGER_FILE);
  rows.push({
    ledgerId: randomUUID(),
    requestId: input.requestId,
    action: input.action,
    amount: input.amount,
    fundingSource: input.fundingSource,
    note: input.note,
    timestamp: Date.now(),
  });
  await writeJsonArray(LEDGER_FILE, rows);
}

export async function createFundingRequest(input: {
  requesterModule: string;
  requesterPerson: string;
  requestType: string;
  accountingCategory: string;
  fundingSource: string;
  workerCount: number;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  notes?: string;
}): Promise<WorkforceFundingRequest> {
  const rows = await readJsonArray<WorkforceFundingRequest>(REQUEST_FILE);
  const now = Date.now();
  const row: WorkforceFundingRequest = {
    requestId: randomUUID(),
    requesterModule: input.requesterModule,
    requesterPerson: input.requesterPerson,
    requestType: input.requestType,
    accountingCategory: input.accountingCategory,
    fundingSource: input.fundingSource,
    workerCount: input.workerCount,
    estimatedCostLow: input.estimatedCostLow,
    estimatedCostHigh: input.estimatedCostHigh,
    notes: input.notes,
    status: "REQUESTED",
    createdAt: now,
    updatedAt: now,
  };

  rows.push(row);
  await writeJsonArray(REQUEST_FILE, rows);
  await appendLedger({
    requestId: row.requestId,
    action: "REQUEST",
    amount: row.estimatedCostLow,
    fundingSource: row.fundingSource,
    note: row.notes,
  });
  return row;
}

export async function updateFundingRequest(
  requestId: string,
  update: {
    status: WorkforceStatus;
    action: WorkforceLedgerEntry["action"];
    amount?: number;
    note?: string;
  }
): Promise<WorkforceFundingRequest | null> {
  const rows = await readJsonArray<WorkforceFundingRequest>(REQUEST_FILE);
  const index = rows.findIndex((row) => row.requestId === requestId);
  if (index < 0) {
    return null;
  }

  const current = rows[index];
  const next: WorkforceFundingRequest = {
    ...current,
    status: update.status,
    notes: update.note ?? current.notes,
    updatedAt: Date.now(),
  };

  rows[index] = next;
  await writeJsonArray(REQUEST_FILE, rows);
  await appendLedger({
    requestId,
    action: update.action,
    amount: update.amount ?? current.estimatedCostLow,
    fundingSource: current.fundingSource,
    note: update.note,
  });

  return next;
}
