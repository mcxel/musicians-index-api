export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";

type StreakBody = {
  period?: "daily" | "weekly" | "monthly";
  currentStreak?: number;
  dailyStreak?: number;
  weeklyStreak?: number;
  contextId?: string;
  metadata?: Record<string, unknown>;
};

function actionForPeriod(period: StreakBody["period"]) {
  if (period === "weekly") return "WEEKLY_STREAK";
  if (period === "monthly") return "MONTHLY_STREAK";
  return "ATTENDANCE_STREAK_DAY";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as StreakBody;

    const forwardReq = new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({
        action: actionForPeriod(body.period),
        contextId: body.contextId,
        metadata: {
          ...(body.metadata ?? {}),
          period: body.period ?? "daily",
          source: "web-streak-route",
        },
        currentStreak: body.currentStreak,
        dailyStreak: body.dailyStreak,
        weeklyStreak: body.weeklyStreak,
        consecutiveAttendanceDays: body.dailyStreak,
      }),
    });

    return proxyToApi(forwardReq, "/api/julius/me/points/action");
  } catch {
    return NextResponse.json({ error: "invalid streak payload" }, { status: 400 });
  }
}
