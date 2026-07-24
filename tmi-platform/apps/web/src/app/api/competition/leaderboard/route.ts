import { NextRequest, NextResponse } from "next/server";
import { LeaderboardService } from "@/lib/competition/LeaderboardService";

export const dynamic = "force-dynamic";

/**
 * GET /api/competition/leaderboard
 * Returns ranked leaderboards from PostgreSQL (XP, Elo/SR, or Battle Wins).
 */
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") ?? "elo";
    const rawLimit = parseInt(req.nextUrl.searchParams.get("limit") ?? "25", 10);
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 25 : rawLimit), 200);

    if (type === "xp") {
      const entries = await LeaderboardService.getXPLeaderboard(limit);
      return NextResponse.json({ success: true, count: entries.length, leaderboard: entries });
    }

    if (type === "elo") {
      const entries = await LeaderboardService.getEloLeaderboard(limit);
      return NextResponse.json({ success: true, count: entries.length, leaderboard: entries });
    }

    if (type === "wins") {
      const entries = await LeaderboardService.getBattleWinsLeaderboard(limit);
      return NextResponse.json({ success: true, count: entries.length, leaderboard: entries });
    }

    return NextResponse.json({ error: "Invalid leaderboard type. Must be 'xp', 'elo', or 'wins'" }, { status: 400 });
  } catch (error) {
    console.error("[competition/leaderboard] GET failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
