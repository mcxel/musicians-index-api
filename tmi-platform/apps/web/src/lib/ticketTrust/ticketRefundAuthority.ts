/**
 * Ticket refund authority — Stripe refund + ticket/credential/inventory/commission.
 * Live Stripe refunds NOT invoked here unless explicitly opted in (tests use dryRun).
 */

import { appendFinancialAudit } from "./financialAuditLedger";
import { restoreToChannel, type InventoryChannel } from "./eventInventoryAuthority";
import { revokeCredential } from "./ticketCredentialAuthority";
import {
  getObligationByOrderId,
  transitionObligation,
} from "./ticketSettlementObligationAuthority";
import {
  markCommissionRefunded,
  type CommissionRecognitionState,
} from "./commissionRecognition";

export type RefundKind =
  | "VOLUNTARY"
  | "CANCELLATION"
  | "PARTIAL"
  | "DUPLICATE_CHARGE"
  | "GOODWILL";

export interface TicketRefundRequest {
  orderId: string;
  ticketIds: string[];
  amountCents: number;
  currency?: string;
  kind: RefundKind;
  reason: string;
  inventoryKey?: string;
  inventoryChannel?: InventoryChannel;
  restoreInventory?: boolean;
  dryRun?: boolean;
  /** Injected Stripe refund fn — never call live from Phase 2 tests. */
  executeStripeRefund?: (args: {
    amountCents: number;
    orderId: string;
  }) => Promise<{ processorRefundId: string }>;
  actor?: string;
}

export interface TicketRefundResult {
  ok: boolean;
  refundRecordId: string;
  processorRefundId: string | null;
  ticketsVoided: string[];
  inventoryRestored: boolean;
  commissionState: CommissionRecognitionState | null;
  settlementState: string | null;
  reason?: string;
}

const refunds: TicketRefundResult[] = [];
let seq = 0;

export async function authorizeAndApplyTicketRefund(
  req: TicketRefundRequest,
): Promise<TicketRefundResult> {
  const refundRecordId = `trf_${Date.now()}_${++seq}`;
  let processorRefundId: string | null = null;

  if (!req.dryRun && req.executeStripeRefund) {
    const r = await req.executeStripeRefund({
      amountCents: req.amountCents,
      orderId: req.orderId,
    });
    processorRefundId = r.processorRefundId;
  } else {
    processorRefundId = req.dryRun ? `dry_${refundRecordId}` : null;
  }

  for (const ticketId of req.ticketIds) {
    revokeCredential(ticketId, req.actor ?? "ticketRefundAuthority");
  }

  let inventoryRestored = false;
  if (req.restoreInventory && req.inventoryKey && req.inventoryChannel) {
    const r = restoreToChannel({
      inventoryKey: req.inventoryKey,
      channel: req.inventoryChannel,
      qty: req.ticketIds.length,
      actor: req.actor ?? "ticketRefundAuthority",
      orderId: req.orderId,
    });
    inventoryRestored = r.ok;
  }

  const commissionState = markCommissionRefunded(req.orderId, req.actor);

  const ob = getObligationByOrderId(req.orderId);
  let settlementState: string | null = null;
  if (ob) {
    const to =
      req.kind === "PARTIAL" || req.ticketIds.length === 0
        ? "PARTIALLY_REFUNDED"
        : "REFUNDED";
    try {
      if (ob.state !== "REFUND_PENDING" && ob.state !== "REFUNDED" && ob.state !== "PARTIALLY_REFUNDED") {
        transitionObligation({
          settlementId: ob.settlementId,
          to: "REFUND_PENDING",
          actor: req.actor ?? "ticketRefundAuthority",
          reason: req.reason,
        });
      }
      const next = transitionObligation({
        settlementId: ob.settlementId,
        to,
        actor: req.actor ?? "ticketRefundAuthority",
        reason: req.reason,
      });
      settlementState = next.state;
    } catch {
      settlementState = ob.state;
    }
  }

  appendFinancialAudit({
    actor: req.actor ?? "ticketRefundAuthority",
    action: "REFUND",
    amountCents: req.amountCents,
    currency: req.currency ?? "usd",
    orderId: req.orderId,
    reason: `${req.kind}:${req.reason}`,
    stripeRef: processorRefundId,
    settlementId: ob?.settlementId,
    metadata: {
      ticketIds: req.ticketIds,
      inventoryRestored,
      refundRecordId,
    },
  });

  const result: TicketRefundResult = {
    ok: true,
    refundRecordId,
    processorRefundId,
    ticketsVoided: req.ticketIds,
    inventoryRestored,
    commissionState,
    settlementState,
  };
  refunds.push(result);
  return result;
}

/** Sync dry-run for cert runners. */
export function authorizeAndApplyTicketRefundDrySync(
  req: Omit<TicketRefundRequest, "dryRun" | "executeStripeRefund">,
): TicketRefundResult {
  // Recreate sync body — call through shared internal by forcing dryRun via deconstructed sync path
  const refundRecordId = `trf_${Date.now()}_${++seq}`;
  const processorRefundId = `dry_${refundRecordId}`;
  for (const ticketId of req.ticketIds) {
    revokeCredential(ticketId, req.actor ?? "ticketRefundAuthority");
  }
  let inventoryRestored = false;
  if (req.restoreInventory && req.inventoryKey && req.inventoryChannel) {
    const r = restoreToChannel({
      inventoryKey: req.inventoryKey,
      channel: req.inventoryChannel,
      qty: req.ticketIds.length,
      actor: req.actor ?? "ticketRefundAuthority",
      orderId: req.orderId,
    });
    inventoryRestored = r.ok;
  }
  const commissionState = markCommissionRefunded(req.orderId, req.actor);
  const ob = getObligationByOrderId(req.orderId);
  let settlementState: string | null = null;
  if (ob) {
    const to =
      req.kind === "PARTIAL" || req.ticketIds.length === 0 ? "PARTIALLY_REFUNDED" : "REFUNDED";
    try {
      if (ob.state !== "REFUND_PENDING" && ob.state !== "REFUNDED" && ob.state !== "PARTIALLY_REFUNDED") {
        transitionObligation({
          settlementId: ob.settlementId,
          to: "REFUND_PENDING",
          actor: req.actor ?? "ticketRefundAuthority",
          reason: req.reason,
        });
      }
      settlementState = transitionObligation({
        settlementId: ob.settlementId,
        to,
        actor: req.actor ?? "ticketRefundAuthority",
        reason: req.reason,
      }).state;
    } catch {
      settlementState = ob.state;
    }
  }
  appendFinancialAudit({
    actor: req.actor ?? "ticketRefundAuthority",
    action: "REFUND",
    amountCents: req.amountCents,
    currency: req.currency ?? "usd",
    orderId: req.orderId,
    reason: `${req.kind}:${req.reason}`,
    stripeRef: processorRefundId,
    settlementId: ob?.settlementId,
    metadata: { ticketIds: req.ticketIds, inventoryRestored, refundRecordId },
  });
  const result: TicketRefundResult = {
    ok: true,
    refundRecordId,
    processorRefundId,
    ticketsVoided: req.ticketIds,
    inventoryRestored,
    commissionState,
    settlementState,
  };
  refunds.push(result);
  return result;
}

export function __resetRefundsForTests(): void {
  refunds.length = 0;
  seq = 0;
}
