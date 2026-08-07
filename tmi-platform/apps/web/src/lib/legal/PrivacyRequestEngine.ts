/**
 * PrivacyRequestEngine — privacy rights intake (ACCESS/DELETE/CORRECT/EXPORT/OPT_OUT).
 * Separate workflow from government disclosure. Still audited; no silent fulfillment.
 */

import { generateLegalCaseId } from "./caseId";
import { appendLegalAuditEvent } from "./LegalAuditLedger";
import type { PrivacyRequestRecord } from "./types";

type PrivacyStore = { requests: PrivacyRequestRecord[] };

function store(): PrivacyStore {
  const g = globalThis as typeof globalThis & { __tmiPrivacyStore?: PrivacyStore };
  if (!g.__tmiPrivacyStore) g.__tmiPrivacyStore = { requests: [] };
  return g.__tmiPrivacyStore;
}

export function submitPrivacyRequest(input: {
  requesterEmail: string;
  requestType: PrivacyRequestRecord["requestType"];
  notes?: string;
}): PrivacyRequestRecord {
  const caseId = generateLegalCaseId();
  const request: PrivacyRequestRecord = {
    requestId: `PRV-${caseId.replace("LEGAL-", "")}`,
    caseId,
    createdAt: new Date().toISOString(),
    requesterEmail: input.requesterEmail.trim().toLowerCase(),
    requestType: input.requestType,
    status: "RECEIVED",
    notes: input.notes?.trim() || "Privacy rights request received — human review required.",
  };
  store().requests.push(request);
  appendLegalAuditEvent({
    caseId,
    type: "PRIVACY_REQUEST_RECEIVED",
    actor: "privacy-intake",
    detail: `${request.requestType} privacy request received from ${request.requesterEmail}`,
    meta: { requestId: request.requestId, requestType: request.requestType },
  });
  return { ...request };
}

export function listPrivacyRequests(limit = 100): PrivacyRequestRecord[] {
  return store()
    .requests.slice(-limit)
    .map((r) => ({ ...r }));
}

export function countOpenPrivacyRequests(): number {
  return store().requests.filter(
    (r) => r.status === "RECEIVED" || r.status === "IN_REVIEW",
  ).length;
}

export function __resetPrivacyRequests(): void {
  store().requests.length = 0;
}
