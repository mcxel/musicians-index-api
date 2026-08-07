/**
 * LegalHoldEngine — place/release holds tied to disclosure cases.
 * Hold does not equal disclose. Delivery still requires HumanApprovalGate.
 */

import type { LegalDataCategory, LegalHoldRecord } from "./types";

type HoldStore = { holds: LegalHoldRecord[] };

function store(): HoldStore {
  const g = globalThis as typeof globalThis & { __tmiLegalHoldStore?: HoldStore };
  if (!g.__tmiLegalHoldStore) g.__tmiLegalHoldStore = { holds: [] };
  return g.__tmiLegalHoldStore;
}

function nextHoldId(): string {
  return `HOLD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function placeLegalHold(input: {
  caseId: string;
  categories: LegalDataCategory[];
  reason: string;
  placedBy: string;
}): LegalHoldRecord {
  const hold: LegalHoldRecord = {
    holdId: nextHoldId(),
    caseId: input.caseId,
    categories: [...input.categories],
    reason: input.reason,
    placedAt: new Date().toISOString(),
    placedBy: input.placedBy,
    active: true,
  };
  store().holds.push(hold);
  return { ...hold, categories: [...hold.categories] };
}

export function releaseLegalHold(holdId: string, releasedBy: string): LegalHoldRecord | null {
  const hold = store().holds.find((h) => h.holdId === holdId);
  if (!hold) return null;
  hold.active = false;
  hold.releasedAt = new Date().toISOString();
  hold.reason = `${hold.reason} · released by ${releasedBy}`;
  return { ...hold, categories: [...hold.categories] };
}

export function listHoldsForCase(caseId: string): LegalHoldRecord[] {
  return store()
    .holds.filter((h) => h.caseId === caseId)
    .map((h) => ({ ...h, categories: [...h.categories] }));
}

export function listActiveHolds(): LegalHoldRecord[] {
  return store()
    .holds.filter((h) => h.active)
    .map((h) => ({ ...h, categories: [...h.categories] }));
}

export function countActiveHolds(): number {
  return store().holds.filter((h) => h.active).length;
}

export function __resetLegalHolds(): void {
  store().holds.length = 0;
}
