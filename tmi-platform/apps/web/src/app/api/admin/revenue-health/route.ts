export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { prisma } from "@/lib/prisma";

/**
 * API endpoint for fetching revenue health data.
 * Returns subscriptions that are at-risk (past_due/unpaid). Admin-only.
 */
export async function GET() {
  const session = await getTmiAuth();
  if (!session || !["admin", "big-ace"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const atRiskSubscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ["past_due", "unpaid"] },
      },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { lastPaymentAttempt: "desc" },
    });
    return NextResponse.json({ atRiskSubscriptions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch revenue health data" }, { status: 500 });
  }
}
