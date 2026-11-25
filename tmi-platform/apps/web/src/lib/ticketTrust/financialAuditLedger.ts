/**
 * Append-only financial audit for ticket/booking settlement.
 * Not virtual-currency LedgerEntry. Durability: in-process + export;
 * Prisma TicketFinancialAuditEntry = MIGRATION_REQUIRED (not applied).
 */

export type FinancialAuditAction =
  | "PAYMENT_CONFIRMED"
  | "SETTLEMENT_STATE"
  | "INVENTORY_ISSUE"
  | "INVENTORY_RESTORE"
  | "CREDENTIAL_ISSUE"
  | "CREDENTIAL_REDEEM"
  | "CREDENTIAL_TRANSFER"
  | "CREDENTIAL_REVOKE"
  | "REFUND"
  | "DISPUTE"
  | "COMMISSION"
  | "FULFILLMENT"
  | "TRANSFER"
  | "RECOUPMENT"
  | "BOOKING_INTENT"
  | "WEBHOOK_IDEMPOTENT_SKIP";

export interface FinancialAuditEntry {
  id: string;
  createdAt: string;
  actor: string;
  action: FinancialAuditAction;
  previousState?: string | null;
  newState?: string | null;
  amountCents?: number | null;
  currency?: string | null;
  reason?: string | null;
  orderId?: string | null;
  ticketId?: string | null;
  eventId?: string | null;
  bookingId?: string | null;
  paymentId?: string | null;
  stripeRef?: string | null;
  settlementId?: string | null;
  metadata?: Record<string, unknown>;
}

const auditLog: FinancialAuditEntry[] = [];
let seq = 0;

export function appendFinancialAudit(
  partial: Omit<FinancialAuditEntry, "id" | "createdAt"> & { createdAt?: string },
): FinancialAuditEntry {
  const entry: FinancialAuditEntry = {
    id: `fa_${Date.now()}_${++seq}`,
    createdAt: partial.createdAt ?? new Date().toISOString(),
    actor: partial.actor,
    action: partial.action,
    previousState: partial.previousState ?? null,
    newState: partial.newState ?? null,
    amountCents: partial.amountCents ?? null,
    currency: partial.currency ?? "usd",
    reason: partial.reason ?? null,
    orderId: partial.orderId ?? null,
    ticketId: partial.ticketId ?? null,
    eventId: partial.eventId ?? null,
    bookingId: partial.bookingId ?? null,
    paymentId: partial.paymentId ?? null,
    stripeRef: partial.stripeRef ?? null,
    settlementId: partial.settlementId ?? null,
    metadata: partial.metadata,
  };
  auditLog.push(entry);
  return entry;
}

export function listFinancialAudit(filter?: {
  orderId?: string;
  eventId?: string;
  settlementId?: string;
}): FinancialAuditEntry[] {
  return auditLog.filter((e) => {
    if (filter?.orderId && e.orderId !== filter.orderId) return false;
    if (filter?.eventId && e.eventId !== filter.eventId) return false;
    if (filter?.settlementId && e.settlementId !== filter.settlementId) return false;
    return true;
  });
}

/** Test-only reset. */
export function __resetFinancialAuditForTests(): void {
  auditLog.length = 0;
  seq = 0;
}

export function __exportFinancialAuditForPersist(): FinancialAuditEntry[] {
  return [...auditLog];
}

export function __importFinancialAuditForPersist(entries: FinancialAuditEntry[]): void {
  auditLog.length = 0;
  for (const e of entries) auditLog.push(e);
  seq = entries.length;
}
