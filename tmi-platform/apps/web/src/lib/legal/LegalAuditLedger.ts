/**
 * Immutable Legal Audit Ledger — append-only event chain with previousHash/eventHash.
 * Proves what happened. Does not grant disclosure authority.
 */

import { createHash } from "crypto";
import type { LegalAuditEvent, LegalAuditEventType } from "./types";

const GENESIS_HASH = "0".repeat(64);

type LedgerStore = {
  events: LegalAuditEvent[];
};

function store(): LedgerStore {
  const g = globalThis as typeof globalThis & { __tmiLegalAuditLedger?: LedgerStore };
  if (!g.__tmiLegalAuditLedger) {
    g.__tmiLegalAuditLedger = { events: [] };
  }
  return g.__tmiLegalAuditLedger;
}

function hashPayload(canonical: string): string {
  return createHash("sha256").update(canonical).digest("hex");
}

function nextEventId(): string {
  return `LAE-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getLastLedgerHash(): string {
  const events = store().events;
  if (events.length === 0) return GENESIS_HASH;
  return events[events.length - 1]!.eventHash;
}

export function appendLegalAuditEvent(input: {
  caseId: string | null;
  type: LegalAuditEventType;
  actor: string;
  detail: string;
  meta?: LegalAuditEvent["meta"];
}): LegalAuditEvent {
  const previousHash = getLastLedgerHash();
  const at = new Date().toISOString();
  const eventId = nextEventId();
  const body = JSON.stringify({
    eventId,
    caseId: input.caseId,
    type: input.type,
    actor: input.actor,
    at,
    detail: input.detail,
    previousHash,
    meta: input.meta ?? null,
  });
  const eventHash = hashPayload(body);
  const event: LegalAuditEvent = {
    eventId,
    caseId: input.caseId,
    type: input.type,
    actor: input.actor,
    at,
    detail: input.detail,
    previousHash,
    eventHash,
    meta: input.meta,
  };
  store().events.push(event);
  return event;
}

export function listLegalAuditEvents(opts?: {
  caseId?: string;
  limit?: number;
}): LegalAuditEvent[] {
  const limit = opts?.limit ?? 200;
  let events = store().events;
  if (opts?.caseId) {
    events = events.filter((e) => e.caseId === opts.caseId);
  }
  return events.slice(-limit);
}

export function verifyLegalAuditChain(): {
  ok: boolean;
  checked: number;
  brokenAt?: string;
  message: string;
} {
  const events = store().events;
  let prev = GENESIS_HASH;
  for (const e of events) {
    if (e.previousHash !== prev) {
      return {
        ok: false,
        checked: events.length,
        brokenAt: e.eventId,
        message: `Chain break at ${e.eventId}: previousHash mismatch`,
      };
    }
    const body = JSON.stringify({
      eventId: e.eventId,
      caseId: e.caseId,
      type: e.type,
      actor: e.actor,
      at: e.at,
      detail: e.detail,
      previousHash: e.previousHash,
      meta: e.meta ?? null,
    });
    const expected = hashPayload(body);
    if (expected !== e.eventHash) {
      return {
        ok: false,
        checked: events.length,
        brokenAt: e.eventId,
        message: `Hash mismatch at ${e.eventId}`,
      };
    }
    prev = e.eventHash;
  }
  return {
    ok: true,
    checked: events.length,
    message:
      events.length === 0
        ? "Ledger empty — honest empty state"
        : `Chain intact (${events.length} events)`,
  };
}

/** Reconstruct case timeline from ledger only (synthetic certification path). */
export function reconstructCaseFromLedger(caseId: string): {
  caseId: string;
  events: LegalAuditEvent[];
  chainOk: boolean;
  summary: string[];
} {
  const events = listLegalAuditEvents({ caseId, limit: 500 });
  const chain = verifyLegalAuditChain();
  const summary = events.map((e) => `${e.at} · ${e.type} · ${e.actor} · ${e.detail}`);
  return { caseId, events, chainOk: chain.ok, summary };
}

export function getLedgerEventCount(): number {
  return store().events.length;
}

/** Test helper — clears process-local ledger. */
export function __resetLegalAuditLedger(): void {
  store().events.length = 0;
}
