/**
 * TMI outbound referral contract.
 * Any module that receives artist referrals from TMI must implement LawServiceAdapter,
 * WillDoItServiceAdapter, etc. TMI calls these adapters — it never embeds their logic.
 */

export interface TMIReferralRequest {
  correlationId: string;
  artist: { id: string; name: string; email?: string };
  reason: string;
  context?: Record<string, string>;
  signature: string; // HMAC-SHA256 of (correlationId + artistId + reason) with module secret
}

export interface TMIReferralResponse {
  referralId: string;
  intakeUrl: string;
  expiresAt: number;
}

/** Shape that every referral-receiving module must expose to TMI */
export interface ReferralReceiver {
  createReferral(req: TMIReferralRequest): Promise<TMIReferralResponse>;
}
