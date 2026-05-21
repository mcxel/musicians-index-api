/**
 * Inter-module contract for Danika's Law.
 *
 * TMI (and any other module) that wants to send users to Law
 * MUST use this contract shape. Law owns the process after handoff.
 */

// ─── Inbound contract (what TMI sends to Law) ─────────────────────────────────

export interface LawReferralRequest {
  /** TMI session ID for correlation */
  correlationId: string;
  artist: {
    id: string;
    name: string;
    email?: string;
  };
  reason:
    | "legal_help"
    | "contract_review"
    | "dmca_notice"
    | "employment_dispute"
    | "general";
  /** Optional context from TMI (e.g., the booking that triggered the referral) */
  context?: Record<string, string>;
  /** HMAC signature of the payload — verified by Law before processing */
  signature: string;
}

export interface LawReferralResponse {
  intakeUrl: string;  // URL to redirect the artist to
  referralId: string; // Law's tracking ID
  expiresAt: number;  // Unix timestamp — link expires
}

// ─── Outbound contract (what Law reports back to TMI) ───────────────────────

export interface LawActivitySummary {
  referralId: string;
  correlationId: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED";
  topicsAddressed: string[];
  resolvedAt?: number;
}

// ─── Service adapter shape (for packages/bridges) ────────────────────────────

export interface LawServiceAdapter {
  createReferral(req: LawReferralRequest): Promise<LawReferralResponse>;
  getActivitySummary(referralId: string): Promise<LawActivitySummary>;
}
