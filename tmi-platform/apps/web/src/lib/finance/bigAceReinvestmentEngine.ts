import { evaluateGovernanceAction } from "@/lib/bots/bigAceAuthorityEngine";
import { logComplianceAction } from "@/lib/legal/complianceGuard";
import { getCoffersBalance, recordLedgerEntry } from "@/lib/finance/businessCoffersLedger";

export const BIG_ACE_ALLOCATION_PERCENT = 0.1;
export const BIG_ACE_TAG = "BigAceReinvestmentHold" as const;

export const APPROVED_USE_CATEGORIES = [
  "system-stability",
  "bot-operations",
  "growth-simulation",
  "platform-improvement",
  "infrastructure",
  "safety-systems",
  "approved-expansion",
  "marketing-test",
  "onboarding-readiness",
] as const;

export type ApprovedUseCategory = (typeof APPROVED_USE_CATEGORIES)[number];

export type ReinvestmentRequest = {
  businessId: string;
  actor: "big-ace" | "marcel-root" | "mc";
  category: string;
  amount: number;
  note: string;
};

export function allocateBigAceReinvestment(businessId: string, grossAmount: number, actor = "system") {
  const allocation = Number((grossAmount * BIG_ACE_ALLOCATION_PERCENT).toFixed(2));

  const entry = recordLedgerEntry({
    businessId,
    type: "allocation",
    amount: allocation,
    source: "business-gross",
    destination: "berntoutglobal-coffers",
    tag: BIG_ACE_TAG,
    note: "Big Ace 10% reinvestment allocation routed to business coffers.",
    actor,
  });

  return {
    allocation,
    entry,
  };
}

export function requestReinvestmentSpend(request: ReinvestmentRequest) {
  const categoryAllowed = APPROVED_USE_CATEGORIES.includes(request.category as ApprovedUseCategory);
  const governance = evaluateGovernanceAction({
    id: `finance-${Date.now()}`,
    type: "financial.transfer",
    actor: request.actor,
    target: request.businessId,
    risk: "high",
  });

  const compliance = logComplianceAction({
    id: `compliance-finance-${Date.now()}`,
    actor: request.actor,
    category: "financial",
    description: request.note,
    finalDecisionRequested: true,
  });

  const balance = getCoffersBalance(request.businessId);
  const blocked =
    !categoryAllowed ||
    !governance.allowed ||
    !compliance.allowed ||
    request.amount <= 0 ||
    request.amount > balance ||
    /cashout|user payout|withdraw/i.test(request.note);

  const reason = !categoryAllowed
    ? "Category is not approved for Big Ace reinvestment use."
    : !governance.allowed
      ? governance.reason
      : !compliance.allowed
        ? compliance.note
        : request.amount > balance
          ? "Insufficient coffer balance for requested spend."
          : /cashout|user payout|withdraw/i.test(request.note)
            ? "User payout/cashout bypass attempts are blocked."
            : "Approved";

  const entry = recordLedgerEntry({
    businessId: request.businessId,
    type: blocked ? "blocked" : "spend",
    amount: Math.abs(request.amount),
    source: "berntoutglobal-coffers",
    destination: blocked ? "blocked-by-policy" : "approved-growth-operation",
    tag: BIG_ACE_TAG,
    note: `${request.note} | ${reason}`,
    actor: request.actor,
  });

  return {
    approved: !blocked,
    reason,
    entry,
    governance,
    compliance,
  };
}
