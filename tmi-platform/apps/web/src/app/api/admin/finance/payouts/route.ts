// api/admin/finance/payouts/route.ts — Admin finance dashboard data

import { NextRequest, NextResponse } from "next/server";
import { getScheduledPayouts, getAuditLog } from "@/lib/finance/PayoutScheduler";
import { getAdminPayoutHistory, getAdminRecipients } from "@/lib/finance/AdminSplitEngine";
import { getRevenueSnapshot, getRecentTransactions } from "@/lib/finance/revenueLedger";
import { calculateProfit } from "@/lib/finance/ProfitEngine";
import { getReserveSummary } from "@/lib/finance/ReserveEngine";
import { getHoldSummary } from "@/lib/finance/RefundRiskEngine";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  return NextResponse.json({
    revenue: getRevenueSnapshot(monthAgo, now),
    profit: calculateProfit(monthAgo, now),
    pendingPayouts: getScheduledPayouts("queued"),
    processingPayouts: getScheduledPayouts("processing"),
    completedPayouts: getScheduledPayouts("paid").slice(0, 50),
    failedPayouts: getScheduledPayouts("failed"),
    adminPayouts: getAdminPayoutHistory(50),
    adminRecipients: getAdminRecipients(),
    auditLog: getAuditLog(100),
    reserves: getReserveSummary(),
    holds: getHoldSummary(),
    recentTransactions: getRecentTransactions(30),
  });
}
