/**
 * Scaffold engines — detection contracts only this pass.
 * Full ML / graph / claim pipelines are deferred (Build Director non-goals).
 */

import type { TrustSafetyReportReason } from "./types";

export type ScamSignal = {
  signal: string;
  confidence: "unknown" | "low" | "medium" | "high";
  deferred: true;
  note: string;
};

/** ScamSignalEngine — scaffold. No ML scoring this pass. */
export function evaluateScamSignals(_input: {
  reasons: TrustSafetyReportReason[];
  detail?: string;
}): ScamSignal[] {
  return [
    {
      signal: "report_reason_heuristic",
      confidence: "unknown",
      deferred: true,
      note: "Scaffold only — real scam signal ML deferred.",
    },
  ];
}

/** ImpersonationDetectionEngine — scaffold. */
export function evaluateImpersonation(_input: {
  accusedId?: string | null;
  detail?: string;
}): { deferred: true; note: string } {
  return {
    deferred: true,
    note: "ImpersonationDetectionEngine scaffold — no deepfake / likeness ML this pass.",
  };
}

/** PaymentRiskEngine — scaffold. */
export function evaluatePaymentRisk(_input: {
  reasons: TrustSafetyReportReason[];
}): { deferred: true; note: string; freezeSuggested: boolean } {
  const freezeSuggested = _input.reasons.includes("payment_scam") || _input.reasons.includes("phishing");
  return {
    deferred: true,
    note: "PaymentRiskEngine scaffold — freeze flag only when reporter opts in / reason matches.",
    freezeSuggested,
  };
}

/** LinkSafetyEngine — scaffold. */
export function evaluateLinkSafety(_urls: string[]): {
  deferred: true;
  note: string;
  urlsChecked: number;
} {
  return {
    deferred: true,
    note: "LinkSafetyEngine scaffold — URL reputation deferred.",
    urlsChecked: 0,
  };
}

/** ContentClaimEngine — scaffold. */
export function evaluateContentClaim(_input: {
  contentHash?: string | null;
}): { deferred: true; note: string } {
  return {
    deferred: true,
    note: "ContentClaimEngine scaffold — ownership claims deferred.",
  };
}

/** AccountRelationshipGraph — scaffold. */
export function queryAccountRelationships(_userId: string): {
  deferred: true;
  note: string;
  edges: never[];
} {
  return {
    deferred: true,
    note: "AccountRelationshipGraph scaffold — graph edges not yet populated.",
    edges: [],
  };
}

/**
 * AppealsEngine — scaffold contract only.
 * Real appeal workflow (submit → review → reinstate) is deferred.
 */
export type AppealScaffold = {
  caseId: string;
  status: "not_implemented";
  note: string;
};

export function createAppealScaffold(caseId: string): AppealScaffold {
  return {
    caseId,
    status: "not_implemented",
    note: "AppealsEngine scaffold — submit/review/reinstate contract reserved; no fake success.",
  };
}
