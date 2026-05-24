// lib/finance/AdminSplitEngine.ts — Configurable admin/owner profit distribution

import { calculateProfit } from "./ProfitEngine";

export type AdminRole = "owner" | "operations" | "technical" | "support" | "reserve";

export type AdminRecipient = {
  id: string;
  name: string;
  role: AdminRole;
  percentage: number;   // 0–100, must sum to 100 across all recipients
  stripeConnectId?: string;
  email: string;
  active: boolean;
};

export type AdminPayoutRecord = {
  id: string;
  recipientId: string;
  recipientName: string;
  amountCents: number;
  periodStart: number;
  periodEnd: number;
  status: "pending" | "processing" | "paid" | "failed";
  stripeTransferId?: string;
  createdAt: number;
  paidAt?: number;
  failureReason?: string;
};

// Default admin split configuration — Marcel can update via OverseerDeck
const defaultRecipients: AdminRecipient[] = [
  { id: "admin-owner",   name: "Marcel Dickens",   role: "owner",      percentage: 50, email: "marcel@tmi.xyz",   active: true },
  { id: "admin-ops",     name: "Michael Charlie",  role: "operations", percentage: 20, email: "michael@tmi.xyz",  active: true },
  { id: "admin-tech",    name: "Tech Reserve",     role: "technical",  percentage: 15, email: "tech@tmi.xyz",     active: true },
  { id: "admin-legal",   name: "Legal Reserve",    role: "reserve",    percentage: 10, email: "legal@tmi.xyz",    active: true },
  { id: "admin-growth",  name: "Growth Fund",      role: "support",    percentage: 5,  email: "growth@tmi.xyz",   active: true },
];

const recipients: AdminRecipient[] = [...defaultRecipients];
const payoutHistory: AdminPayoutRecord[] = [];
let counter = 1;

export function getAdminRecipients(): AdminRecipient[] {
  return [...recipients];
}

export function updateAdminRecipient(id: string, patch: Partial<AdminRecipient>): boolean {
  const idx = recipients.findIndex(r => r.id === id);
  if (idx === -1) return false;
  recipients[idx] = { ...recipients[idx], ...patch };
  return true;
}

export function validateSplitPercentages(): { valid: boolean; total: number } {
  const total = recipients.filter(r => r.active).reduce((s, r) => s + r.percentage, 0);
  return { valid: total === 100, total };
}

export function calculateAdminSplits(
  periodStart: number,
  periodEnd: number
): AdminPayoutRecord[] {
  const profit = calculateProfit(periodStart, periodEnd);
  const distributable = profit.availableForPayouts;

  if (distributable <= 0) return [];

  return recipients
    .filter(r => r.active)
    .map(r => ({
      id: `ADMIN-PAY-${Date.now()}-${String(counter++).padStart(4, "0")}`,
      recipientId: r.id,
      recipientName: r.name,
      amountCents: Math.round(distributable * (r.percentage / 100)),
      periodStart,
      periodEnd,
      status: "pending" as const,
      createdAt: Date.now(),
    }));
}

export function recordAdminPayout(record: AdminPayoutRecord): void {
  payoutHistory.push(record);
}

export function getAdminPayoutHistory(limit = 100): AdminPayoutRecord[] {
  return [...payoutHistory].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function markAdminPayoutPaid(id: string, stripeTransferId: string): boolean {
  const record = payoutHistory.find(r => r.id === id);
  if (!record) return false;
  record.status = "paid";
  record.paidAt = Date.now();
  record.stripeTransferId = stripeTransferId;
  return true;
}

export function markAdminPayoutFailed(id: string, reason: string): boolean {
  const record = payoutHistory.find(r => r.id === id);
  if (!record) return false;
  record.status = "failed";
  record.failureReason = reason;
  return true;
}
