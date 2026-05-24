// lib/payments/GatewayDispatcher.ts — Unified payment gateway dispatcher
// Normalizes Stripe, PayPal, and any future gateway into a single TransactionEvent
// and feeds it into the revenue ledger + profit engine.

import { recordTransaction } from "@/lib/finance/revenueLedger";
import type { TransactionType } from "@/lib/finance/revenueLedger";

export type GatewayOrigin = "stripe" | "paypal" | "cash_app" | "local_money";

export type TransactionTarget = "PERFORMER_PAYOUT" | "SYSTEM_FEE" | "GROWTH_FUND";

export type NormalizedTransaction = {
  txId: string;
  amount: number;          // in cents
  currency: string;
  origin: GatewayOrigin;
  userId: string;
  recipientId?: string;
  type: TransactionType;
  target: TransactionTarget;
  metadata: Record<string, string>;
  receivedAt: number;
};

export type DispatchResult = {
  success: boolean;
  ledgerEntryId?: string;
  normalizedTx: NormalizedTransaction;
  error?: string;
};

// Idempotency store — prevents double-processing same payment signal
const processedIds = new Set<string>();

export function hasBeenProcessed(txId: string): boolean {
  return processedIds.has(txId);
}

export function markProcessed(txId: string): void {
  processedIds.add(txId);
}

export function normalizeStripe(event: {
  id: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  customerId?: string;
}): NormalizedTransaction {
  const meta = event.metadata ?? {};
  return {
    txId: event.id,
    amount: event.amount,
    currency: (event.currency ?? "usd").toUpperCase(),
    origin: "stripe",
    userId: meta.userId ?? meta.customerId ?? event.customerId ?? "anonymous",
    recipientId: meta.recipientId,
    type: (meta.type ?? "tip") as TransactionType,
    target: (meta.target as TransactionTarget) ?? "PERFORMER_PAYOUT",
    metadata: { ...meta, stripeId: event.id },
    receivedAt: Date.now(),
  };
}

export function normalizePayPal(event: {
  id: string;
  amount: { value: string; currency_code: string };
  custom_id?: string;
  payer?: { email_address?: string; payer_id?: string };
  metadata?: Record<string, string>;
}): NormalizedTransaction {
  const amountCents = Math.round(parseFloat(event.amount.value) * 100);
  const meta = event.metadata ?? {};
  const customParts = event.custom_id?.split(":") ?? [];

  return {
    txId: `paypal_${event.id}`,
    amount: amountCents,
    currency: event.amount.currency_code ?? "USD",
    origin: "paypal",
    userId: customParts[0] ?? event.payer?.payer_id ?? "anonymous",
    recipientId: customParts[1],
    type: (customParts[2] ?? "tip") as TransactionType,
    target: (customParts[3] as TransactionTarget) ?? "PERFORMER_PAYOUT",
    metadata: {
      ...meta,
      paypalOrderId: event.id,
      payerEmail: event.payer?.email_address ?? "",
    },
    receivedAt: Date.now(),
  };
}

export function dispatch(tx: NormalizedTransaction): DispatchResult {
  if (hasBeenProcessed(tx.txId)) {
    return { success: false, normalizedTx: tx, error: "duplicate_transaction" };
  }

  try {
    const entry = recordTransaction(
      tx.type,
      tx.amount,
      tx.userId,
      tx.recipientId,
      tx.origin === "stripe" ? tx.metadata.stripeId : undefined,
      { ...tx.metadata, origin: tx.origin, target: tx.target }
    );

    markProcessed(tx.txId);

    return { success: true, ledgerEntryId: entry.id, normalizedTx: tx };
  } catch (err) {
    return {
      success: false,
      normalizedTx: tx,
      error: err instanceof Error ? err.message : "dispatch_error",
    };
  }
}
