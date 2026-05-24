// api/finance/payouts/preview/route.ts — Preview upcoming payout amounts

import { NextRequest, NextResponse } from "next/server";
import { calculateProfit } from "@/lib/finance/ProfitEngine";
import { calculateAdminSplits } from "@/lib/finance/AdminSplitEngine";
import { getReleasableHolds, getHoldSummary } from "@/lib/finance/RefundRiskEngine";
import { getNextPayoutDate } from "@/lib/finance/PayoutScheduler";
import { getRevenueSnapshot } from "@/lib/finance/revenueLedger";
import { getReserveSummary } from "@/lib/finance/ReserveEngine";

export async function GET(req: NextRequest) {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const profit = calculateProfit(weekAgo, now);
  const revenue = getRevenueSnapshot(weekAgo, now);
  const adminSplits = calculateAdminSplits(weekAgo, now);
  const holdSummary = getHoldSummary();
  const reserves = getReserveSummary();

  return NextResponse.json({
    period: { start: weekAgo, end: now },
    revenue: {
      gross: revenue.totalGross,
      platformRevenue: revenue.totalPlatformRevenue,
      creatorPayouts: revenue.totalCreatorPayouts,
      pending: revenue.pendingPayouts,
    },
    profit: {
      net: profit.netProfit,
      available: profit.availableForPayouts,
      reserved: profit.reserveHeld,
      margin: profit.profitMargin,
    },
    adminPayouts: adminSplits.map(s => ({
      name: s.recipientName,
      amount: s.amountCents,
    })),
    holds: holdSummary,
    reserves,
    nextPayoutDates: {
      creators: getNextPayoutDate("twice_weekly").toISOString(),
      admins:   getNextPayoutDate("weekly").toISOString(),
    },
  });
}
