/**
 * AuthorityVerificationEngine
 *
 * Badge / email alone NEVER advances to VERIFIED for disclosure.
 * States: UNVERIFIED | IDENTITY_VERIFIED | DOCUMENTS_PENDING |
 * LEGAL_REVIEW_REQUIRED | VERIFIED | REJECTED | EXPIRED
 */

import type { AuthorityVerificationState } from "./types";

export type AuthoritySignal = {
  hasBadgeClaim: boolean;
  hasEmailClaim: boolean;
  identityDocumentReceived: boolean;
  agencyRosterMatch: boolean;
  counselReviewed: boolean;
  expired: boolean;
  rejected: boolean;
};

const ORDER: AuthorityVerificationState[] = [
  "UNVERIFIED",
  "IDENTITY_VERIFIED",
  "DOCUMENTS_PENDING",
  "LEGAL_REVIEW_REQUIRED",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
];

export function isAuthorityVerificationState(v: string): v is AuthorityVerificationState {
  return (ORDER as string[]).includes(v);
}

/**
 * Evaluate signals → state.
 * Explicit rule: badge+email without documents/counsel → never VERIFIED.
 */
export function evaluateAuthoritySignals(signals: AuthoritySignal): {
  state: AuthorityVerificationState;
  reasons: string[];
  disclosureEligible: boolean;
} {
  const reasons: string[] = [];

  if (signals.rejected) {
    return {
      state: "REJECTED",
      reasons: ["Authority request rejected by human/counsel review"],
      disclosureEligible: false,
    };
  }
  if (signals.expired) {
    return {
      state: "EXPIRED",
      reasons: ["Authority credentials or request window expired"],
      disclosureEligible: false,
    };
  }

  if (!signals.hasBadgeClaim && !signals.hasEmailClaim && !signals.identityDocumentReceived) {
    return {
      state: "UNVERIFIED",
      reasons: ["No authority identity signals received"],
      disclosureEligible: false,
    };
  }

  // Badge/email alone — identity tip only
  if ((signals.hasBadgeClaim || signals.hasEmailClaim) && !signals.identityDocumentReceived) {
    reasons.push("Badge/email claim recorded — insufficient for VERIFIED disclosure");
    return {
      state: "IDENTITY_VERIFIED",
      reasons,
      disclosureEligible: false,
    };
  }

  if (signals.identityDocumentReceived && !signals.agencyRosterMatch) {
    reasons.push("Documents received — agency roster match pending");
    return {
      state: "DOCUMENTS_PENDING",
      reasons,
      disclosureEligible: false,
    };
  }

  if (signals.identityDocumentReceived && signals.agencyRosterMatch && !signals.counselReviewed) {
    reasons.push("Identity + roster matched — counsel legal review required");
    return {
      state: "LEGAL_REVIEW_REQUIRED",
      reasons,
      disclosureEligible: false,
    };
  }

  if (
    signals.identityDocumentReceived &&
    signals.agencyRosterMatch &&
    signals.counselReviewed
  ) {
    reasons.push("Authority verified by identity + roster + counsel review");
    return {
      state: "VERIFIED",
      reasons,
      disclosureEligible: true,
    };
  }

  return {
    state: "UNVERIFIED",
    reasons: ["Incomplete authority signals"],
    disclosureEligible: false,
  };
}

/** Hard gate: only VERIFIED may proceed past authority check for disclosure packages. */
export function canProceedPastAuthorityGate(state: AuthorityVerificationState): boolean {
  return state === "VERIFIED";
}

export function authorityStateLabel(state: AuthorityVerificationState): string {
  switch (state) {
    case "UNVERIFIED":
      return "Unverified";
    case "IDENTITY_VERIFIED":
      return "Identity tip only (not disclosure-ready)";
    case "DOCUMENTS_PENDING":
      return "Documents pending";
    case "LEGAL_REVIEW_REQUIRED":
      return "Legal review required";
    case "VERIFIED":
      return "Verified";
    case "REJECTED":
      return "Rejected";
    case "EXPIRED":
      return "Expired";
    default:
      return state;
  }
}
