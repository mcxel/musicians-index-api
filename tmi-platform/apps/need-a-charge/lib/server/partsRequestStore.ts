import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export interface PartsRequest {
  requestId: string;
  itemSku: string;
  quantity: number;
  reason: string;
  requestedBy: string;
  status: "REQUESTED" | "RESERVED" | "REJECTED";
  createdAt: number;
}

const REQUEST_FILE = resolve(process.cwd(), "data", "parts-requests.json");

async function readRequests(): Promise<PartsRequest[]> {
  try {
    const raw = await readFile(REQUEST_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PartsRequest[]) : [];
  } catch {
    return [];
  }
}

async function writeRequests(rows: PartsRequest[]): Promise<void> {
  await mkdir(dirname(REQUEST_FILE), { recursive: true });
  await writeFile(REQUEST_FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function createPartsRequest(input: {
  itemSku: string;
  quantity: number;
  reason: string;
  requestedBy: string;
}): Promise<PartsRequest> {
  const rows = await readRequests();
  const row: PartsRequest = {
    requestId: randomUUID(),
    itemSku: input.itemSku,
    quantity: input.quantity,
    reason: input.reason,
    requestedBy: input.requestedBy,
    status: "REQUESTED",
    createdAt: Date.now(),
  };
  rows.push(row);
  await writeRequests(rows);
  return row;
}
