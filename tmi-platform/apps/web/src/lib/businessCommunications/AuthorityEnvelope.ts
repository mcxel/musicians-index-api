import type {
  AuthorityEnvelope,
  BusinessCommsAction,
  BusinessCommsAgentId,
  BusinessCommsLane,
  FinancialAuthorityLimit,
  ForbiddenAutonomousAction,
} from "./types";

export const DEFAULT_FORBIDDEN_AUTONOMOUS: ForbiddenAutonomousAction[] = [
  "refund",
  "bank_transfer",
  "legal_commitment",
  "pricing_floor_override",
  "unsubscribe_override",
  "privacy_override",
];

/** Sponsor acquisition — list prices from SponsorSlotRegistry; no sub-floor quotes. */
export const SPONSOR_ACQUISITION_FINANCIAL_LIMIT: FinancialAuthorityLimit = {
  pricingFloorUsd: 150,
  humanApprovalAboveUsd: 500,
  maxAutonomousDiscountUsd: 0,
  maxDealValueUsd: 750,
};

export function buildAuthorityEnvelope(input: {
  agentId: BusinessCommsAgentId;
  operatorId: string;
  mailboxScope: string[];
  authorityScope: BusinessCommsAction[];
  dealScope: BusinessCommsLane[];
  financialLimit: FinancialAuthorityLimit;
  approvedStrategyIds?: string[];
  ttlMs?: number;
}): AuthorityEnvelope {
  const now = Date.now();
  return {
    envelopeId: `env-${input.agentId}-${now}`,
    agentId: input.agentId,
    operatorId: input.operatorId,
    mailboxScope: input.mailboxScope,
    authorityScope: input.authorityScope,
    dealScope: input.dealScope,
    financialLimit: input.financialLimit,
    forbiddenAutonomous: [...DEFAULT_FORBIDDEN_AUTONOMOUS],
    approvedStrategyIds: input.approvedStrategyIds ?? ["sponsor_standard_package_v1"],
    issuedAt: now,
    expiresAt: input.ttlMs ? now + input.ttlMs : undefined,
  };
}

export function envelopeAllowsAction(
  envelope: AuthorityEnvelope,
  action: BusinessCommsAction,
): boolean {
  if (envelope.expiresAt && Date.now() > envelope.expiresAt) return false;
  return envelope.authorityScope.includes(action);
}

export function validateQuoteWithinEnvelope(
  envelope: AuthorityEnvelope,
  quotedUsd: number,
): { ok: boolean; requiresHuman: boolean; reason?: string } {
  const { financialLimit: f } = envelope;
  if (quotedUsd < f.pricingFloorUsd) {
    return {
      ok: false,
      requiresHuman: true,
      reason: `quote_below_pricing_floor_${f.pricingFloorUsd}`,
    };
  }
  if (quotedUsd > f.maxDealValueUsd) {
    return {
      ok: false,
      requiresHuman: true,
      reason: `quote_above_max_deal_${f.maxDealValueUsd}`,
    };
  }
  if (quotedUsd > f.humanApprovalAboveUsd) {
    return { ok: true, requiresHuman: true };
  }
  return { ok: true, requiresHuman: false };
}

export function bigAceSponsorEnvelope(operatorId: string): AuthorityEnvelope {
  return buildAuthorityEnvelope({
    agentId: "sponsor-acquisition",
    operatorId,
    mailboxScope: [
      process.env.BUSINESS_MAIL_SPONSORS ?? "sponsors@themusiciansindex.com",
    ],
    authorityScope: ["READ", "TRIAGE", "DRAFT", "SEND", "DEAL_FOLLOW_UP", "COMMITMENT_UPDATE"],
    dealScope: ["sponsor_acquisition"],
    financialLimit: SPONSOR_ACQUISITION_FINANCIAL_LIMIT,
    approvedStrategyIds: ["sponsor_standard_package_v1", "sponsor_magazine_bundle_v1"],
    ttlMs: 1000 * 60 * 60 * 8,
  });
}
