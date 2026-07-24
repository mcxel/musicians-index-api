import { NextRequest, NextResponse } from "next/server";
import { competitionIntegrityEngine } from "@/lib/competition/CompetitionIntegrityEngine";

export const dynamic = "force-dynamic";

/**
 * GET /api/competition/integrity
 * Queries ratings or matchmaking distance between two competitors.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const userIdA = req.nextUrl.searchParams.get("userIdA");
    const userIdB = req.nextUrl.searchParams.get("userIdB");

    if (userIdA && userIdB) {
      const a = await competitionIntegrityEngine.fetchRatings(userIdA);
      const b = await competitionIntegrityEngine.fetchRatings(userIdB);
      const distance = competitionIntegrityEngine.getMatchmakingDistance(a, b);
      return NextResponse.json({ success: true, distance, a, b });
    }

    if (userId) {
      const ratings = await competitionIntegrityEngine.fetchRatings(userId);
      return NextResponse.json({ success: true, ratings });
    }

    return NextResponse.json({ error: "Missing parameters. Required: userId OR (userIdA and userIdB)" }, { status: 400 });
  } catch (error) {
    console.error("Failed to GET competitor integrity data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/competition/integrity
 * Updates match outcomes, completions, or timeout occurrences.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === "outcome") {
      const { challengerId, opponentId, challengerScore } = body;
      if (!challengerId || !opponentId || typeof challengerScore !== "number") {
        return NextResponse.json({ error: "challengerId, opponentId, and challengerScore required" }, { status: 400 });
      }
      const result = await competitionIntegrityEngine.recordMatchOutcome(challengerId, opponentId, challengerScore);
      return NextResponse.json({ success: true, result });
    }

    if (type === "timeout") {
      const { userId, streak, isPlatformIssue } = body;
      if (!userId || typeof streak !== "number") {
        return NextResponse.json({ error: "userId and streak required" }, { status: 400 });
      }
      const penalty = await competitionIntegrityEngine.recordTimeout(userId, streak, !!isPlatformIssue);
      return NextResponse.json({ success: true, penalty });
    }

    if (type === "completion") {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ error: "userId required" }, { status: 400 });
      }
      const ratings = await competitionIntegrityEngine.recordSuccessfulCompletion(userId);
      return NextResponse.json({ success: true, ratings });
    }

    return NextResponse.json({ error: "Invalid execution type. Must be: outcome, timeout, or completion" }, { status: 400 });
  } catch (error) {
    console.error("Failed to POST competitor integrity event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
