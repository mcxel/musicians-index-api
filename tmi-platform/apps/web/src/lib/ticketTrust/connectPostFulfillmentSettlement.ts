/**
 * Post-fulfillment Connect transfer — server-calculated entitlements only.
 * dryRun default true. Live Stripe transfers forbidden unless explicitly enabled
 * AND settlement is SETTLEMENT_ELIGIBLE. No client grossUSD.
 */

import { appendFinancialAudit } from "./financialAuditLedger";
import { markCommissionEarned, markCommissionSettlementEligible } from "./commissionRecognition";
import {
  canReleaseConnectTransfer,
  transitionObligation,
} from "./ticketSettlementObligationAuthority";

export interface SettlementEntitlementBreakdown {
  grossCents: number;
  refundedCents: number;
  disputeHoldCents: number;
  platformFeeCents: number;
  venuePromoterCents: number;
  performerCents: number;
  authorizedDeductionsCents: number;
  transferableCents: number;
}

export function calculateSettlementEntitlements(input: {
  grossCents: number;
  refundedCents?: number;
  disputeHoldCents?: number;
  platformFeeCents: number;
  performerCents?: number;
  authorizedDeductionsCents?: number;
}): SettlementEntitlementBreakdown {
  const refundedCents = input.refundedCents ?? 0;
  const disputeHoldCents = input.disputeHoldCents ?? 0;
  const performerCents = input.performerCents ?? 0;
  const authorizedDeductionsCents = input.authorizedDeductionsCents ?? 0;
  const net = Math.max(0, input.grossCents - refundedCents - disputeHoldCents);
  const platformFeeCents = Math.min(input.platformFeeCents, net);
  const afterPlatform = Math.max(0, net - platformFeeCents - authorizedDeductionsCents);
  const venuePromoterCents = Math.max(0, afterPlatform - performerCents);
  const transferableCents = venuePromoterCents; // delayed Connect to organizer
  return {
    grossCents: input.grossCents,
    refundedCents,
    disputeHoldCents,
    platformFeeCents,
    venuePromoterCents,
    performerCents,
    authorizedDeductionsCents,
    transferableCents,
  };
}

const transfersBySettlement = new Map<string, string>();

export async function releasePostFulfillmentConnectTransfer(input: {
  settlementId: string;
  platformFeeCents: number;
  destinationAccountId: string;
  refundedCents?: number;
  performerCents?: number;
  authorizedDeductionsCents?: number;
  dryRun?: boolean;
  /** Injected — never call live Stripe from Phase 2 default path. */
  executeTransfer?: (args: {
    amountCents: number;
    destinationAccountId: string;
    idempotencyKey: string;
  }) => Promise<{ transferId: string }>;
  actor?: string;
}): Promise<{
  ok: boolean;
  reason: string;
  breakdown: SettlementEntitlementBreakdown | null;
  transferId: string | null;
}> {
  const existing = transfersBySettlement.get(input.settlementId);
  if (existing) {
    return {
      ok: true,
      reason: "idempotent_replay",
      breakdown: null,
      transferId: existing,
    };
  }

  const gate = canReleaseConnectTransfer(input.settlementId);
  if (!gate.ok || !gate.obligation) {
    return { ok: false, reason: gate.reason, breakdown: null, transferId: null };
  }

  const ob = gate.obligation;
  const breakdown = calculateSettlementEntitlements({
    grossCents: ob.grossCents,
    refundedCents: input.refundedCents,
    platformFeeCents: input.platformFeeCents,
    performerCents: input.performerCents,
    authorizedDeductionsCents: input.authorizedDeductionsCents,
  });

  markCommissionSettlementEligible(ob.orderId, input.actor);

  const dryRun = input.dryRun !== false;
  let transferId: string | null = null;
  const idempotencyKey = `ticket_settle_${input.settlementId}`;

  if (dryRun) {
    transferId = `dry_tr_${input.settlementId}`;
  } else {
    if (!input.executeTransfer) {
      return {
        ok: false,
        reason: "BLOCKED_EXTERNAL:executeTransfer_not_provided",
        breakdown,
        transferId: null,
      };
    }
    if (!input.destinationAccountId.startsWith("acct_")) {
      return {
        ok: false,
        reason: "BLOCKED_EXTERNAL:invalid_destination",
        breakdown,
        transferId: null,
      };
    }
    const r = await input.executeTransfer({
      amountCents: breakdown.transferableCents,
      destinationAccountId: input.destinationAccountId,
      idempotencyKey,
    });
    transferId = r.transferId;
  }

  transfersBySettlement.set(input.settlementId, transferId);
  markCommissionEarned(ob.orderId, input.actor);
  transitionObligation({
    settlementId: input.settlementId,
    to: "SETTLED",
    actor: input.actor ?? "connectPostFulfillmentSettlement",
    reason: dryRun ? "dry_run_settled" : "connect_transfer_submitted",
  });

  appendFinancialAudit({
    actor: input.actor ?? "connectPostFulfillmentSettlement",
    action: "TRANSFER",
    amountCents: breakdown.transferableCents,
    orderId: ob.orderId,
    eventId: ob.eventId,
    settlementId: input.settlementId,
    stripeRef: transferId,
    newState: "SETTLED",
    metadata: { breakdown, dryRun, destinationAccountId: input.destinationAccountId },
  });

  return { ok: true, reason: dryRun ? "dry_run_ok" : "transferred", breakdown, transferId };
}

/** Synchronous dry-run for cert runners (no live Stripe). */
export function releasePostFulfillmentConnectTransferDrySync(input: {
  settlementId: string;
  platformFeeCents: number;
  destinationAccountId: string;
  refundedCents?: number;
  performerCents?: number;
  authorizedDeductionsCents?: number;
  actor?: string;
}): {
  ok: boolean;
  reason: string;
  breakdown: SettlementEntitlementBreakdown | null;
  transferId: string | null;
} {
  const existing = transfersBySettlement.get(input.settlementId);
  if (existing) {
    return { ok: true, reason: "idempotent_replay", breakdown: null, transferId: existing };
  }
  const gate = canReleaseConnectTransfer(input.settlementId);
  if (!gate.ok || !gate.obligation) {
    return { ok: false, reason: gate.reason, breakdown: null, transferId: null };
  }
  const ob = gate.obligation;
  const breakdown = calculateSettlementEntitlements({
    grossCents: ob.grossCents,
    refundedCents: input.refundedCents,
    platformFeeCents: input.platformFeeCents,
    performerCents: input.performerCents,
    authorizedDeductionsCents: input.authorizedDeductionsCents,
  });
  markCommissionSettlementEligible(ob.orderId, input.actor);
  const transferId = `dry_tr_${input.settlementId}`;
  transfersBySettlement.set(input.settlementId, transferId);
  markCommissionEarned(ob.orderId, input.actor);
  transitionObligation({
    settlementId: input.settlementId,
    to: "SETTLED",
    actor: input.actor ?? "connectPostFulfillmentSettlement.drySync",
    reason: "dry_run_settled",
  });
  appendFinancialAudit({
    actor: input.actor ?? "connectPostFulfillmentSettlement.drySync",
    action: "TRANSFER",
    amountCents: breakdown.transferableCents,
    orderId: ob.orderId,
    eventId: ob.eventId,
    settlementId: input.settlementId,
    stripeRef: transferId,
    newState: "SETTLED",
    metadata: { breakdown, dryRun: true, destinationAccountId: input.destinationAccountId },
  });
  return { ok: true, reason: "dry_run_ok", breakdown, transferId };
}

export function __resetTransfersForTests(): void {
  transfersBySettlement.clear();
}

export function __exportTransfersForPersist(): Array<[string, string]> {
  return [...transfersBySettlement.entries()];
}

export function __importTransfersForPersist(rows: Array<[string, string]>): void {
  transfersBySettlement.clear();
  for (const [k, v] of rows) transfersBySettlement.set(k, v);
}
