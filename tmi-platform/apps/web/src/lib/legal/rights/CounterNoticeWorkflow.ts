/**
 * CounterNoticeWorkflow — scaffolding for counter-notice after takedown restriction.
 * Always requires human review. Does not invent statutory text.
 */

import { appendLegalAuditEvent } from "../LegalAuditLedger";
import { advanceTakedown, listTakedowns } from "./TakedownWorkflow";
import type { CounterNoticeRecord } from "./types";

type Store = { notices: Map<string, CounterNoticeRecord> };

function store(): Store {
  const g = globalThis as typeof globalThis & { __tmiCounterNotice?: Store };
  if (!g.__tmiCounterNotice) g.__tmiCounterNotice = { notices: new Map() };
  return g.__tmiCounterNotice;
}

export function getCounterNoticePolicyStub(): string {
  return (
    "Counsel-reviewed placeholder counter-notice workflow. Filers may submit a counter-notice " +
    "during the counter window; restoration is never automatic without human process. Not legal advice."
  );
}

export function fileCounterNotice(input: {
  takedownId: string;
  filerUserId: string;
  statement: string;
}): CounterNoticeRecord | { error: string } {
  const takedown = listTakedowns(200).find((t) => t.takedownId === input.takedownId);
  if (!takedown) return { error: "Takedown case not found" };
  if (
    takedown.status !== "CONTENT_RESTRICTED" &&
    takedown.status !== "COUNTER_WINDOW" &&
    takedown.status !== "NOTICE_SENT"
  ) {
    return { error: "Counter-notice only available during notice/restriction/counter window" };
  }

  const record: CounterNoticeRecord = {
    counterId: `CN-${Date.now().toString(36).toUpperCase()}`,
    takedownId: input.takedownId,
    assetId: takedown.assetId,
    filerUserId: input.filerUserId.trim(),
    statement: input.statement.trim(),
    status: "FILED",
    createdAt: new Date().toISOString(),
    humanReviewRequired: true,
  };
  store().notices.set(record.counterId, record);

  advanceTakedown(input.takedownId, "COUNTER_WINDOW", input.filerUserId);

  appendLegalAuditEvent({
    caseId: null,
    type: "COUNTER_NOTICE_FILED",
    actor: input.filerUserId,
    detail: `${record.counterId} for ${input.takedownId}`,
    meta: { counterId: record.counterId, takedownId: input.takedownId },
  });

  return { ...record, humanReviewRequired: true };
}

export function listCounterNotices(limit = 50): CounterNoticeRecord[] {
  return Array.from(store().notices.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((n) => ({ ...n, humanReviewRequired: true as const }));
}
