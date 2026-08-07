/**
 * RepeatInfringerPolicy — strike tracking hooks for repeat copyright abuse.
 * Scaffold only — suspension still requires human/admin process.
 */

import { appendLegalAuditEvent } from "../LegalAuditLedger";
import type { RepeatInfringerStrike } from "./types";

type Store = { byUser: Map<string, RepeatInfringerStrike> };

function store(): Store {
  const g = globalThis as typeof globalThis & { __tmiRepeatInfringer?: Store };
  if (!g.__tmiRepeatInfringer) g.__tmiRepeatInfringer = { byUser: new Map() };
  return g.__tmiRepeatInfringer;
}

function policyForCount(n: number): RepeatInfringerStrike["policyAction"] {
  if (n <= 0) return "NONE";
  if (n === 1) return "WARN";
  if (n === 2) return "RESTRICT";
  return "SUSPEND_CANDIDATE";
}

export function recordInfringerStrike(userId: string, note: string): RepeatInfringerStrike {
  const s = store();
  const existing = s.byUser.get(userId);
  const strikeCount = (existing?.strikeCount ?? 0) + 1;
  const record: RepeatInfringerStrike = {
    userId,
    strikeCount,
    lastStrikeAt: new Date().toISOString(),
    notes: [...(existing?.notes ?? []), note],
    policyAction: policyForCount(strikeCount),
  };
  s.byUser.set(userId, record);
  appendLegalAuditEvent({
    caseId: null,
    type: "REPEAT_INFRINGER_STRIKE",
    actor: "RepeatInfringerPolicy",
    detail: `${userId} strike ${strikeCount} → ${record.policyAction}`,
    meta: { userId, strikeCount, policyAction: record.policyAction },
  });
  return { ...record, notes: [...record.notes] };
}

export function getInfringerStrike(userId: string): RepeatInfringerStrike | null {
  const hit = store().byUser.get(userId);
  return hit ? { ...hit, notes: [...hit.notes] } : null;
}

export function listInfringerStrikes(limit = 50): RepeatInfringerStrike[] {
  return Array.from(store().byUser.values())
    .sort((a, b) => b.lastStrikeAt.localeCompare(a.lastStrikeAt))
    .slice(0, limit)
    .map((r) => ({ ...r, notes: [...r.notes] }));
}

export function getRepeatInfringerPolicyStub(): string {
  return (
    "Counsel-reviewed placeholder: repeat infringers may receive warnings, restrictions, " +
    "and suspension candidacy after multiple validated takedowns. Human/admin process required. Not legal advice."
  );
}
