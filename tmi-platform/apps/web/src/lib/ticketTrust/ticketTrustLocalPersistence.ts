/**
 * Local durable Ticket Trust store — process-reload survival WITHOUT production DB migration.
 * Activated via TICKET_TRUST_LOCAL_PERSIST=1 or cert harness.
 * Production Prisma migration = NOT APPLIED (see artifacts).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export type DurableTicketTrustSnapshot = {
  version: 1;
  obligations: unknown[];
  credentials: unknown[];
  audits: unknown[];
  transfers: Array<[string, string]>;
  updatedAt: string;
};

const DEFAULT_DIR = join(process.cwd(), ".ticket-trust-local");
const SNAPSHOT_FILE = "snapshot.json";

let persistEnabled = process.env.TICKET_TRUST_LOCAL_PERSIST === "1";
let storeDir = DEFAULT_DIR;

export function enableTicketTrustLocalPersist(dir?: string): void {
  persistEnabled = true;
  if (dir) storeDir = dir;
  mkdirSync(storeDir, { recursive: true });
}

export function disableTicketTrustLocalPersist(): void {
  persistEnabled = false;
}

export function isTicketTrustLocalPersistEnabled(): boolean {
  return persistEnabled;
}

export function getTicketTrustLocalPersistPath(): string {
  return join(storeDir, SNAPSHOT_FILE);
}

export function saveTicketTrustSnapshot(snap: DurableTicketTrustSnapshot): void {
  if (!persistEnabled) return;
  mkdirSync(storeDir, { recursive: true });
  writeFileSync(getTicketTrustLocalPersistPath(), JSON.stringify(snap, null, 2), "utf8");
}

export function loadTicketTrustSnapshot(): DurableTicketTrustSnapshot | null {
  const path = getTicketTrustLocalPersistPath();
  if (!existsSync(path)) return null;
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as DurableTicketTrustSnapshot;
    if (raw?.version !== 1) return null;
    return raw;
  } catch {
    return null;
  }
}

export function clearTicketTrustLocalSnapshot(): void {
  const path = getTicketTrustLocalPersistPath();
  if (existsSync(path)) writeFileSync(path, "", "utf8");
}
