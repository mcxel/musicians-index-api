import { NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";

const EVENT_TO_ACTION: Record<string, string> = {
  battle_join: "BATTLE_JOIN",
  battle_win: "BATTLE_WIN",
  battle_loss: "BATTLE_LOSS",
  cypher_join: "CYPHER_JOIN",
  cypher_win: "CYPHER_WIN",
  venue_attendance: "VENUE_ATTENDANCE",
  show_attendance: "SHOW_ATTENDANCE",
  quiz_win: "QUIZ_WIN",
  poll_vote: "POLL_PARTICIPATION",
  fan_vote_cast: "FAN_VOTE_CAST",
  watch_full_battle: "WATCH_FULL_BATTLE",
  watch_full_cypher: "WATCH_FULL_CYPHER",
  watch_full_show: "WATCH_FULL_SHOW",
  room_attendance_time: "ROOM_ATTENDANCE_TIME",
};

type AwardBody = {
  action?: string;
  event?: string;
  contextId?: string;
  metadata?: Record<string, unknown>;
  quantity?: number;
  consecutiveAttendanceDays?: number;
  firstActionInSession?: boolean;
  isWeekendEvent?: boolean;
  currentStreak?: number;
  dailyStreak?: number;
  weeklyStreak?: number;
  rankMovement?: number;
  nextUnlock?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AwardBody;
    const resolvedAction = body.action ?? (body.event ? EVENT_TO_ACTION[body.event.toLowerCase()] : undefined);

    if (!resolvedAction) {
      return NextResponse.json(
        { error: "action or a known event is required" },
        { status: 400 },
      );
    }

    const forwardReq = new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({
        action: resolvedAction,
        contextId: body.contextId,
        metadata: {
          ...(body.metadata ?? {}),
          source: "web-award-route",
        },
        quantity: body.quantity,
        consecutiveAttendanceDays: body.consecutiveAttendanceDays,
        firstActionInSession: body.firstActionInSession,
        isWeekendEvent: body.isWeekendEvent,
        currentStreak: body.currentStreak,
        dailyStreak: body.dailyStreak,
        weeklyStreak: body.weeklyStreak,
        rankMovement: body.rankMovement,
        nextUnlock: body.nextUnlock,
      }),
    });

    return proxyToApi(forwardReq, "/api/julius/me/points/action");
  } catch {
    return NextResponse.json({ error: "invalid award payload" }, { status: 400 });
  }
}
