// lib/finance/ProfitEngine.ts — Platform profit calculation after expenses

import { getRevenueSnapshot, type RevenueSnapshot } from "./revenueLedger";

export type ExpenseCategory =
  | "infrastructure" | "stripe_fees" | "refunds" | "chargebacks"
  | "advertising" | "support" | "legal" | "misc";

export type ExpenseEntry = {
  id: string;
  category: ExpenseCategory;
  amountCents: number;
  description: string;
  periodStart: number;
  periodEnd: number;
  recordedAt: number;
};

export type ProfitReport = {
  periodStart: number;
  periodEnd: number;
  grossRevenue: number;
  platformRevenue: number;
  totalExpenses: number;
  netProfit: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  profitMargin: number;        // 0–1
  availableForPayouts: number; // after reserve
  reserveHeld: number;
};

// In-memory expense store (replace with DB in production)
const expenses: ExpenseEntry[] = [];
let counter = 1;

// Reserve percentage held back from profit (infrastructure + legal buffer)
const RESERVE_RATIO = 0.15; // 15%

export function recordExpense(
  category: ExpenseCategory,
  amountCents: number,
  description: string,
  periodStart: number,
  periodEnd: number
): ExpenseEntry {
  const entry: ExpenseEntry = {
    id: `EXP-${Date.now()}-${String(counter++).padStart(4, "0")}`,
    category,
    amountCents,
    description,
    periodStart,
    periodEnd,
    recordedAt: Date.now(),
  };
  expenses.push(entry);
  return entry;
}

export function getExpenses(periodStart?: number, periodEnd?: number): ExpenseEntry[] {
  const start = periodStart ?? 0;
  const end   = periodEnd   ?? Date.now();
  return expenses.filter(e => e.recordedAt >= start && e.recordedAt <= end);
}

export function calculateProfit(periodStart?: number, periodEnd?: number): ProfitReport {
  const snapshot: RevenueSnapshot = getRevenueSnapshot(periodStart, periodEnd);
  const periodExpenses = getExpenses(periodStart, periodEnd);

  const expensesByCategory = {} as Record<ExpenseCategory, number>;
  let totalExpenses = 0;

  for (const e of periodExpenses) {
    expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + e.amountCents;
    totalExpenses += e.amountCents;
  }

  const platformRevenue = snapshot.totalPlatformRevenue;
  const netProfit = Math.max(0, platformRevenue - totalExpenses);
  const reserveHeld = Math.round(netProfit * RESERVE_RATIO);
  const availableForPayouts = netProfit - reserveHeld;

  return {
    periodStart: snapshot.periodStart,
    periodEnd: snapshot.periodEnd,
    grossRevenue: snapshot.totalGross,
    platformRevenue,
    totalExpenses,
    netProfit,
    expensesByCategory,
    profitMargin: platformRevenue > 0 ? netProfit / platformRevenue : 0,
    availableForPayouts,
    reserveHeld,
  };
}

// Estimate Stripe fees: 2.9% + $0.30 per transaction
export function estimateStripeFees(grossAmountCents: number, transactionCount: number): number {
  return Math.round(grossAmountCents * 0.029) + transactionCount * 30;
}
