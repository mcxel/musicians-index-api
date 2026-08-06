export const dynamic = "force-dynamic";

/**
 * GET /api/fan/stats?userId=...
 *
 * Returns FanAnalyticsMetrics for a user. Authenticated users can always
 * read their own stats. Admins can read any userId.
 * All values are real DB counts — never Math.random (Rule 20).
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readFanAnalytics } from "@/lib/analytics/roleAnalyticsReader";
import { emptyFanAnalytics } from "@/lib/analytics/roleAnalyticsContracts";

async function resolveCallerAndTarget(
  req: NextRequest,
): Promise<{ callerId: string | null; callerRole: string; targetId: string | null }> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (!email) return { callerId: null, callerRole: "guest", targetId: null };

  const caller = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
  if (!caller) return { callerId: null, callerRole: "guest", targetId: null };

  const requestedId = req.nextUrl.searchParams.get("userId");
  // Admins may query any userId; others can only read their own stats
  const targetId =
    requestedId && caller.role === "ADMIN" ? requestedId : caller.id;

  return { callerId: caller.id, callerRole: caller.role, targetId };
}

export async function GET(req: NextRequest) {
  const { callerId, targetId } = await resolveCallerAndTarget(req);

  if (!callerId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const metrics = targetId
    ? await readFanAnalytics(targetId)
    : emptyFanAnalytics(callerId);

  return NextResponse.json({ metrics });
}
