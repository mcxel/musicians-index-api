/**
 * DisputeCenter — human-review queue for claim/complaint conflicts.
 * Does not auto-resolve ownership.
 */

import { appendLegalAuditEvent } from "../LegalAuditLedger";
import type { DisputeCaseRecord, DisputeCaseStatus } from "./types";

type Store = { disputes: Map<string, DisputeCaseRecord> };

function store(): Store {
  const g = globalThis as typeof globalThis & { __tmiDisputeCenter?: Store };
  if (!g.__tmiDisputeCenter) g.__tmiDisputeCenter = { disputes: new Map() };
  return g.__tmiDisputeCenter;
}

function nextId(): string {
  return `DISP-${Date.now().toString(36).toUpperCase()}`;
}

export function openDisputeFromClaim(input: {
  assetId: string;
  claimId: string;
  summary: string;
}): DisputeCaseRecord {
  const now = new Date().toISOString();
  const record: DisputeCaseRecord = {
    disputeId: nextId(),
    assetId: input.assetId,
    claimId: input.claimId,
    complaintId: null,
    status: "HUMAN_REVIEW",
    summary: input.summary,
    createdAt: now,
    updatedAt: now,
    humanReviewRequired: true,
  };
  store().disputes.set(record.disputeId, record);
  appendLegalAuditEvent({
    caseId: null,
    type: "DISPUTE_OPENED",
    actor: "DisputeCenter",
    detail: `${record.disputeId} for claim ${input.claimId}`,
    meta: { disputeId: record.disputeId, assetId: input.assetId },
  });
  return { ...record, humanReviewRequired: true };
}

export function openDisputeFromComplaint(input: {
  assetId: string;
  complaintId: string;
  summary: string;
}): DisputeCaseRecord {
  const now = new Date().toISOString();
  const record: DisputeCaseRecord = {
    disputeId: nextId(),
    assetId: input.assetId,
    claimId: null,
    complaintId: input.complaintId,
    status: "EVIDENCE_GATHERING",
    summary: input.summary,
    createdAt: now,
    updatedAt: now,
    humanReviewRequired: true,
  };
  store().disputes.set(record.disputeId, record);
  appendLegalAuditEvent({
    caseId: null,
    type: "DISPUTE_OPENED",
    actor: "DisputeCenter",
    detail: `${record.disputeId} for complaint ${input.complaintId}`,
    meta: { disputeId: record.disputeId, assetId: input.assetId },
  });
  return { ...record, humanReviewRequired: true };
}

export function advanceDispute(
  disputeId: string,
  status: DisputeCaseStatus,
  actor: string,
): DisputeCaseRecord | { error: string } {
  const hit = store().disputes.get(disputeId);
  if (!hit) return { error: "Dispute not found" };
  hit.status = status;
  hit.updatedAt = new Date().toISOString();
  appendLegalAuditEvent({
    caseId: null,
    type: "RIGHTS_DECISION",
    actor,
    detail: `Dispute ${disputeId} → ${status}`,
  });
  return { ...hit, humanReviewRequired: true };
}

export function listDisputes(limit = 100): DisputeCaseRecord[] {
  return Array.from(store().disputes.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((d) => ({ ...d, humanReviewRequired: true as const }));
}

export function countOpenDisputes(): number {
  return Array.from(store().disputes.values()).filter(
    (d) => d.status !== "CLOSED" && d.status !== "RESOLVED_UPHOLD" && d.status !== "RESOLVED_REJECT",
  ).length;
}
