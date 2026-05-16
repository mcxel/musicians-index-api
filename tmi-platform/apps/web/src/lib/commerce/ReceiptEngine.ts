import type { CommerceItemType, TaxRegion, ReceiptBreakdown } from "@/lib/subscriptions/SubscriptionTaxEngine";
import { getReceiptBreakdown } from "@/lib/subscriptions/SubscriptionTaxEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReceiptLineItem = {
  label: string;
  amountCents: number;
  amountDisplay: string;
};

export type Receipt = {
  id: string;
  timestampMs: number;
  userId: string;
  itemType: CommerceItemType;
  label: string;
  region: TaxRegion;
  lines: ReceiptLineItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  subtotalDisplay: string;
  taxDisplay: string;
  totalDisplay: string;
  metadata?: Record<string, string | number>;
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const receiptLog: Receipt[] = [];
let _counter = 0;

function centsToDollarStr(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateReceipt(
  userId: string,
  itemType: CommerceItemType,
  label: string,
  subtotalCents: number,
  region: TaxRegion,
  metadata?: Record<string, string | number>,
): Receipt {
  const breakdown: ReceiptBreakdown = getReceiptBreakdown(itemType, label, subtotalCents, region);

  const receipt: Receipt = {
    id: `rcpt-${++_counter}-${Date.now()}`,
    timestampMs: Date.now(),
    userId,
    itemType,
    label,
    region,
    lines: [
      { label: "Subtotal",  amountCents: breakdown.subtotalCents, amountDisplay: breakdown.subtotalDisplay },
      { label: "Tax",       amountCents: breakdown.taxCents,      amountDisplay: breakdown.taxDisplay      },
      { label: "Total",     amountCents: breakdown.totalCents,    amountDisplay: breakdown.totalDisplay    },
    ],
    subtotalCents: breakdown.subtotalCents,
    taxCents:      breakdown.taxCents,
    totalCents:    breakdown.totalCents,
    subtotalDisplay: breakdown.subtotalDisplay,
    taxDisplay:      breakdown.taxDisplay,
    totalDisplay:    breakdown.totalDisplay,
    metadata,
  };

  receiptLog.push(receipt);
  if (receiptLog.length > 1000) receiptLog.splice(0, receiptLog.length - 1000);

  return receipt;
}

export function getReceiptById(id: string): Receipt | undefined {
  return receiptLog.find(r => r.id === id);
}

export function getReceiptsForUser(userId: string, limit: number = 50): Receipt[] {
  return receiptLog.filter(r => r.userId === userId).slice(-limit);
}

export function formatReceiptText(receipt: Receipt): string {
  const lines = [
    `TMI Platform — Receipt`,
    `ID: ${receipt.id}`,
    `Date: ${new Date(receipt.timestampMs).toISOString()}`,
    `Item: ${receipt.label}`,
    `─────────────────────`,
    ...receipt.lines.map(l => `${l.label.padEnd(16)} ${l.amountDisplay}`),
  ];
  return lines.join("\n");
}
