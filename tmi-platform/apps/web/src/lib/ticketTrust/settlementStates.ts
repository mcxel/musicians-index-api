/**
 * Ticket Trust — protected settlement states.
 *
 * Order.status "PAID" may continue to mean payment succeeded (compat).
 * SettlementObligation.state carries fulfillment/payout eligibility.
 * NEVER label these as legal "escrow".
 *
 * Funds-flow (Phase 2 authorized):
 * PLATFORM CHECKOUT → PAID_PROTECTED/UNSETTLED → FULFILLMENT → SETTLEMENT_ELIGIBLE
 * → server entitlements → Connect transfer → SETTLED
 * Immediate destination charge on ticket checkout = NOT AUTHORIZED.
 */

export const TICKET_FUNDS_FLOW_POLICY = {
  model: "PLATFORM_CHARGE_THEN_DELAYED_CONNECT_TRANSFER",
  immediateDestinationChargeAuthorized: false,
  legalEscrowClaimed: false,
  terminology: ["PROTECTED", "UNSETTLED", "PAYOUT_HELD", "SETTLEMENT_ELIGIBLE"] as const,
} as const;

export type TicketSettlementState =
  | "PAYMENT_PENDING"
  | "PAID_PROTECTED"
  | "EVENT_PENDING"
  | "FULFILLMENT_PENDING"
  | "SETTLEMENT_ELIGIBLE"
  | "SETTLED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "DISPUTED"
  | "CHARGEBACK"
  | "PAYOUT_HELD"
  | "CANCELLED"
  | "RISK_REVIEW";

const ALLOWED: Record<TicketSettlementState, readonly TicketSettlementState[]> = {
  PAYMENT_PENDING: ["PAID_PROTECTED", "CANCELLED"],
  PAID_PROTECTED: ["EVENT_PENDING", "REFUND_PENDING", "DISPUTED", "PAYOUT_HELD", "CANCELLED", "RISK_REVIEW"],
  EVENT_PENDING: ["FULFILLMENT_PENDING", "REFUND_PENDING", "DISPUTED", "PAYOUT_HELD", "CANCELLED", "EVENT_PENDING"],
  FULFILLMENT_PENDING: ["SETTLEMENT_ELIGIBLE", "REFUND_PENDING", "DISPUTED", "PAYOUT_HELD", "CANCELLED", "RISK_REVIEW"],
  SETTLEMENT_ELIGIBLE: ["SETTLED", "PAYOUT_HELD", "DISPUTED", "REFUND_PENDING", "RISK_REVIEW"],
  SETTLED: ["DISPUTED", "CHARGEBACK", "PARTIALLY_REFUNDED"], // rare post-settle disputes
  REFUND_PENDING: ["REFUNDED", "PARTIALLY_REFUNDED", "PAID_PROTECTED", "DISPUTED"],
  REFUNDED: [],
  PARTIALLY_REFUNDED: ["REFUNDED", "SETTLEMENT_ELIGIBLE", "PAYOUT_HELD", "DISPUTED"],
  DISPUTED: ["CHARGEBACK", "PAID_PROTECTED", "SETTLEMENT_ELIGIBLE", "REFUNDED", "PAYOUT_HELD", "RISK_REVIEW"],
  CHARGEBACK: ["REFUNDED", "PAYOUT_HELD", "RISK_REVIEW"],
  PAYOUT_HELD: ["SETTLEMENT_ELIGIBLE", "RISK_REVIEW", "REFUND_PENDING", "DISPUTED", "CANCELLED"],
  CANCELLED: ["REFUND_PENDING", "REFUNDED"],
  RISK_REVIEW: ["PAID_PROTECTED", "PAYOUT_HELD", "SETTLEMENT_ELIGIBLE", "CANCELLED", "DISPUTED"],
};

export function canTransitionSettlement(
  from: TicketSettlementState,
  to: TicketSettlementState,
): boolean {
  if (from === to) return true;
  return (ALLOWED[from] ?? []).includes(to);
}

export function assertSettlementTransition(
  from: TicketSettlementState,
  to: TicketSettlementState,
): void {
  if (!canTransitionSettlement(from, to)) {
    throw new Error(`illegal_settlement_transition:${from}->${to}`);
  }
}

/** Payment success creates protected obligation — not SETTLED. */
export function settlementStateAfterSuccessfulPayment(): TicketSettlementState {
  return "PAID_PROTECTED";
}

export function isDistributable(state: TicketSettlementState): boolean {
  return state === "SETTLEMENT_ELIGIBLE" || state === "SETTLED";
}

export function blocksPayout(state: TicketSettlementState): boolean {
  return (
    state === "PAYOUT_HELD" ||
    state === "DISPUTED" ||
    state === "CHARGEBACK" ||
    state === "REFUND_PENDING" ||
    state === "REFUNDED" ||
    state === "CANCELLED" ||
    state === "RISK_REVIEW" ||
    state === "PAYMENT_PENDING" ||
    state === "PAID_PROTECTED" ||
    state === "EVENT_PENDING" ||
    state === "FULFILLMENT_PENDING"
  );
}
