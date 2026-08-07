/**
 * Copyright complaint / takedown intake scaffolding.
 * Wires into Legal Audit Ledger. Complements /dmca policy page + TrustSafety.
 * Does not auto-remove content without human/process steps.
 */

import { generateLegalCaseId } from "../caseId";
import { appendLegalAuditEvent } from "../LegalAuditLedger";
import { rejectForbiddenLicenseClaim } from "./CopyrightNoticeEngine";
import type { CopyrightComplaintRecord } from "./types";

type Store = { complaints: CopyrightComplaintRecord[] };

function store(): Store {
  const g = globalThis as typeof globalThis & { __tmiCopyrightComplaints?: Store };
  if (!g.__tmiCopyrightComplaints) g.__tmiCopyrightComplaints = { complaints: [] };
  return g.__tmiCopyrightComplaints;
}

export function submitCopyrightComplaint(input: {
  claimantName: string;
  claimantEmail: string;
  workDescription: string;
  infringingUrlOrRoom: string;
  goodFaithStatement: boolean;
  perjuryStatement: boolean;
  notes?: string;
}): CopyrightComplaintRecord | { error: string } {
  const banned = rejectForbiddenLicenseClaim(
    `${input.workDescription} ${input.notes ?? ""}`,
  );
  if (!banned.ok) return { error: banned.error! };

  if (!input.claimantName.trim() || !input.claimantEmail.trim()) {
    return { error: "Claimant name and email are required" };
  }
  if (!input.goodFaithStatement || !input.perjuryStatement) {
    return { error: "Good-faith and perjury statements are required" };
  }

  const caseId = generateLegalCaseId();
  const record: CopyrightComplaintRecord = {
    complaintId: `DMCA-${caseId.replace("LEGAL-", "")}`,
    caseId,
    claimantName: input.claimantName.trim(),
    claimantEmail: input.claimantEmail.trim().toLowerCase(),
    workDescription: input.workDescription.trim(),
    infringingUrlOrRoom: input.infringingUrlOrRoom.trim(),
    goodFaithStatement: true,
    perjuryStatement: true,
    status: "RECEIVED",
    createdAt: new Date().toISOString(),
    notes:
      input.notes?.trim() ||
      "Copyright complaint received — claimant verification and preservation required before removal.",
  };
  store().complaints.push(record);

  appendLegalAuditEvent({
    caseId,
    type: "COPYRIGHT_COMPLAINT_RECEIVED",
    actor: "copyright-intake",
    detail: `Complaint ${record.complaintId} for ${record.infringingUrlOrRoom}`,
    meta: { complaintId: record.complaintId },
  });

  return { ...record };
}

export function advanceCopyrightComplaint(
  complaintId: string,
  next: CopyrightComplaintRecord["status"],
  actor: string,
): CopyrightComplaintRecord | { error: string } {
  const hit = store().complaints.find((c) => c.complaintId === complaintId);
  if (!hit) return { error: "Complaint not found" };
  hit.status = next;
  appendLegalAuditEvent({
    caseId: hit.caseId,
    type: "COPYRIGHT_COMPLAINT_ADVANCED",
    actor,
    detail: `Complaint ${complaintId} → ${next}`,
  });
  return { ...hit };
}

export function listCopyrightComplaints(limit = 100): CopyrightComplaintRecord[] {
  return store()
    .complaints.slice(-limit)
    .map((c) => ({ ...c }));
}

export function countOpenCopyrightComplaints(): number {
  return store().complaints.filter((c) => c.status !== "CLOSED").length;
}
