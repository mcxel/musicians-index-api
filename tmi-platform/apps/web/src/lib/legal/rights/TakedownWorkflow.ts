/**
 * TakedownWorkflow — scaffolding for complaint → preservation → restrict → counter window.
 * Does not hard-delete content without process. Counsel-reviewed policy stubs — AI does not invent law.
 */

import { appendLegalAuditEvent } from "../LegalAuditLedger";
import { openDisputeFromComplaint } from "./DisputeCenter";
import { recordInfringerStrike } from "./RepeatInfringerPolicy";
import type { TakedownCaseRecord, TakedownCaseStatus } from "./types";

type Store = { cases: Map<string, TakedownCaseRecord> };

function store(): Store {
  const g = globalThis as typeof globalThis & { __tmiTakedownWorkflow?: Store };
  if (!g.__tmiTakedownWorkflow) g.__tmiTakedownWorkflow = { cases: new Map() };
  return g.__tmiTakedownWorkflow;
}

const POLICY_STUB =
  "Counsel-reviewed placeholder takedown policy text. Not legal advice. AI must not invent law.";

export function getTakedownPolicyStub(): string {
  return POLICY_STUB;
}

export function startTakedown(input: {
  assetId: string;
  complaintId?: string | null;
  allegedUploaderId?: string | null;
  actor: string;
}): TakedownCaseRecord {
  const now = new Date().toISOString();
  const record: TakedownCaseRecord = {
    takedownId: `TD-${Date.now().toString(36).toUpperCase()}`,
    assetId: input.assetId,
    complaintId: input.complaintId ?? null,
    status: "INTAKE",
    createdAt: now,
    updatedAt: now,
    contentHardDeleted: false,
    notes: "Takedown intake — preservation required before restriction. Content not hard-deleted.",
  };
  store().cases.set(record.takedownId, record);

  if (input.complaintId) {
    openDisputeFromComplaint({
      assetId: input.assetId,
      complaintId: input.complaintId,
      summary: `Takedown ${record.takedownId} linked to complaint ${input.complaintId}`,
    });
  }

  appendLegalAuditEvent({
    caseId: null,
    type: "TAKEDOWN_ADVANCED",
    actor: input.actor,
    detail: `${record.takedownId} INTAKE for ${input.assetId}`,
    meta: { takedownId: record.takedownId, assetId: input.assetId },
  });

  // Advance to preservation immediately (scaffold)
  return advanceTakedown(record.takedownId, "PRESERVATION", input.actor) as TakedownCaseRecord;
}

export function advanceTakedown(
  takedownId: string,
  status: TakedownCaseStatus,
  actor: string,
  allegedUploaderId?: string | null,
): TakedownCaseRecord | { error: string } {
  const hit = store().cases.get(takedownId);
  if (!hit) return { error: "Takedown case not found" };
  hit.status = status;
  hit.updatedAt = new Date().toISOString();
  hit.contentHardDeleted = false;
  if (status === "CONTENT_RESTRICTED") {
    hit.notes = `${hit.notes} · Restricted (not hard-deleted)`;
    if (allegedUploaderId) {
      recordInfringerStrike(allegedUploaderId, `Takedown ${takedownId} restricted`);
    }
  }
  appendLegalAuditEvent({
    caseId: null,
    type: "TAKEDOWN_ADVANCED",
    actor,
    detail: `${takedownId} → ${status}`,
  });
  return { ...hit, contentHardDeleted: false };
}

export function listTakedowns(limit = 50): TakedownCaseRecord[] {
  return Array.from(store().cases.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((t) => ({ ...t, contentHardDeleted: false as const }));
}

export function countActiveTakedowns(): number {
  return Array.from(store().cases.values()).filter(
    (t) => t.status !== "FINALIZED" && t.status !== "RESTORED",
  ).length;
}
