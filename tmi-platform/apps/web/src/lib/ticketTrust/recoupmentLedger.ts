/**
 * Recoupment accounting — debt records ≠ bank debit authority.
 */

import { appendFinancialAudit } from "./financialAuditLedger";

export type RecoupmentKind =
  | "REFUND_DEFICIT"
  | "DISPUTE_DEFICIT"
  | "CHARGEBACK_DEFICIT"
  | "LOGISTICS_DEFICIT"
  | "OTHER";

export type RecoupmentStatus =
  | "OPEN"
  | "PARTIAL"
  | "RECOVERED"
  | "WRITTEN_OFF"
  | "ESCALATED_MANUAL";

export interface RecoupmentDebtRecord {
  debtId: string;
  kind: RecoupmentKind;
  amountCents: number;
  recoveredCents: number;
  status: RecoupmentStatus;
  orderId: string | null;
  eventId: string | null;
  merchantUserId: string | null;
  /** Explicit: this record alone does NOT authorize bank debit. */
  bankDebitAuthorized: false;
  createdAt: string;
  updatedAt: string;
}

const debts = new Map<string, RecoupmentDebtRecord>();
let seq = 0;

export function recordRecoupmentDebt(input: {
  kind: RecoupmentKind;
  amountCents: number;
  orderId?: string | null;
  eventId?: string | null;
  merchantUserId?: string | null;
  actor?: string;
}): RecoupmentDebtRecord {
  const debtId = `debt_${Date.now()}_${++seq}`;
  const rec: RecoupmentDebtRecord = {
    debtId,
    kind: input.kind,
    amountCents: input.amountCents,
    recoveredCents: 0,
    status: "OPEN",
    orderId: input.orderId ?? null,
    eventId: input.eventId ?? null,
    merchantUserId: input.merchantUserId ?? null,
    bankDebitAuthorized: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  debts.set(debtId, rec);
  appendFinancialAudit({
    actor: input.actor ?? "recoupmentLedger",
    action: "RECOUPMENT",
    amountCents: input.amountCents,
    orderId: input.orderId,
    eventId: input.eventId,
    newState: "OPEN",
    reason: `${input.kind}:accounting_only_no_bank_debit`,
    metadata: { debtId, bankDebitAuthorized: false },
  });
  return rec;
}

export function applyAuthorizedOffset(input: {
  debtId: string;
  amountCents: number;
  source: "UNSETTLED_FUNDS" | "FUTURE_PAYOUT_OFFSET" | "MERCHANT_BALANCE" | "PROVIDER_RECOVERY";
  actor?: string;
}): RecoupmentDebtRecord {
  const rec = debts.get(input.debtId);
  if (!rec) throw new Error("debt_not_found");
  const apply = Math.min(input.amountCents, rec.amountCents - rec.recoveredCents);
  rec.recoveredCents += apply;
  rec.status =
    rec.recoveredCents >= rec.amountCents
      ? "RECOVERED"
      : rec.recoveredCents > 0
        ? "PARTIAL"
        : "OPEN";
  rec.updatedAt = new Date().toISOString();
  appendFinancialAudit({
    actor: input.actor ?? "recoupmentLedger",
    action: "RECOUPMENT",
    amountCents: apply,
    orderId: rec.orderId,
    eventId: rec.eventId,
    newState: rec.status,
    reason: `authorized_offset:${input.source}`,
    metadata: { debtId: rec.debtId, bankDebitAuthorized: false },
  });
  return rec;
}

export function getDebt(debtId: string): RecoupmentDebtRecord | null {
  return debts.get(debtId) ?? null;
}

export function __resetRecoupmentForTests(): void {
  debts.clear();
  seq = 0;
}
