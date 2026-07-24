import { NextRequest, NextResponse } from "next/server";
import { matchHistoryEngine } from "@/lib/competition/MatchHistoryEngine";

export const dynamic = "force-dynamic";

/**
 * GET /api/competition/match-history
 * Queries dynamic player stats or head-to-head records.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const userIdA = req.nextUrl.searchParams.get("userIdA");
    const userIdB = req.nextUrl.searchParams.get("userIdB");

    if (userIdA && userIdB) {
      const headToHead = await matchHistoryEngine.getHeadToHead(userIdA, userIdB);
      return NextResponse.json({ success: true, headToHead });
    }

    if (userId) {
      const stats = await matchHistoryEngine.getPlayerStats(userId);
      return NextResponse.json({ success: true, stats });
    }

    return NextResponse.json({ error: "Missing parameters. Required: userId OR (userIdA and userIdB)" }, { status: 400 });
  } catch (error) {
    console.error("Failed to query match history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/competition/match-history
 * Creates a new match history entry.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      venueType,
      venueId,
      competitionType,
      challengerId,
      opponentId,
      challengerScore,
      opponentScore,
      winnerId,
      resultType,
      ratingBeforeChallenger,
      ratingAfterChallenger,
      ratingBeforeOpponent,
      ratingAfterOpponent,
      integrityBeforeChallenger,
      integrityAfterChallenger,
      integrityBeforeOpponent,
      integrityAfterOpponent,
    } = body;

    if (
      !venueType ||
      !venueId ||
      !competitionType ||
      !challengerId ||
      !opponentId ||
      typeof challengerScore !== "number" ||
      typeof opponentScore !== "number"
    ) {
      return NextResponse.json({ error: "Missing required match history parameters" }, { status: 400 });
    }

    const record = await matchHistoryEngine.recordMatchResult({
      venueType,
      venueId,
      competitionType,
      challengerId,
      opponentId,
      challengerScore,
      opponentScore,
      winnerId: winnerId || null,
      resultType: resultType || "decisive",
      ratingBeforeChallenger: ratingBeforeChallenger ?? 1200,
      ratingAfterChallenger: ratingAfterChallenger ?? 1200,
      ratingBeforeOpponent: ratingBeforeOpponent ?? 1200,
      ratingAfterOpponent: ratingAfterOpponent ?? 1200,
      integrityBeforeChallenger: integrityBeforeChallenger ?? 100,
      integrityAfterChallenger: integrityAfterChallenger ?? 100,
      integrityBeforeOpponent: integrityBeforeOpponent ?? 100,
      integrityAfterOpponent: integrityAfterOpponent ?? 100,
    });

    return NextResponse.json({ success: true, match: record });
  } catch (error) {
    console.error("Failed to record match history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
