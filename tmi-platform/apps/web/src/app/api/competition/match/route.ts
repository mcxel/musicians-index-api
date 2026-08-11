import { NextRequest, NextResponse } from "next/server";
import { battleMatchLifecycleEngine, type BattleMatchLifecycle } from "@/lib/competition/BattleMatchLifecycleEngine";
import { competitionIntegrityEngine } from "@/lib/competition/CompetitionRatingStore";
import { matchHistoryEngine } from "@/lib/competition/MatchHistoryEngine";
import { eventOrchestrator } from "@/lib/competition/EventOrchestrator";

export const dynamic = "force-dynamic";

/**
 * Server-only equivalent of the old BattleMatchLifecycleEngine.finalizeWithIntegrity()
 * (moved here so the client-safe lifecycle engine never imports
 * CompetitionIntegrityEngine -> prisma -> `pg`, which broke the production
 * build - `pg` needs Node-only fs/net/tls/dns that don't exist in a browser
 * bundle). Marks the match completed, runs the Elo outcome + MatchHistory
 * write, then credits attendance for both participants.
 */
async function finalizeMatchWithIntegrity(
  battleId: string,
  winnerId: string,
  loserId: string,
  opts?: { venueType?: string; competitionType?: string }
): Promise<{
  match: BattleMatchLifecycle | null;
  winnerRatings: Awaited<ReturnType<typeof competitionIntegrityEngine.recordMatchOutcome>>["challenger"];
  loserRatings: Awaited<ReturnType<typeof competitionIntegrityEngine.recordMatchOutcome>>["opponent"];
  historyRecord: Awaited<ReturnType<typeof competitionIntegrityEngine.recordMatchOutcome>>["historyRecord"];
}> {
  const match = battleMatchLifecycleEngine.markCompleted(battleId, winnerId);

  const { challenger: winnerRatings, opponent: loserRatings, historyRecord } =
    await competitionIntegrityEngine.recordMatchOutcome(winnerId, loserId, 1, {
      venueType: opts?.venueType ?? "battle",
      venueId: battleId,
      competitionType: opts?.competitionType ?? "BATTLE",
      matchId: battleId, // Ensures exact 1:1 finalization mapping on duplicate retries
    });

  // Attendance credit for both — restores CIR/AR gradually
  await Promise.all([
    competitionIntegrityEngine.recordSuccessfulCompletion(winnerId),
    competitionIntegrityEngine.recordSuccessfulCompletion(loserId),
  ]);

  return { match, winnerRatings, loserRatings, historyRecord };
}

/**
 * POST /api/competition/match
 * Central dispatcher for all match lifecycle events: finalize, disconnect, completion.
 *
 * Body shapes:
 *   { type: "finalize", battleId, winnerId, loserId }
 *     → marks match completed, runs Elo update, records successful completion for both.
 *
 *   { type: "disconnect", battleId?, userId, streak, isPlatformIssue? }
 *     → applies escalating timeout penalty via CIS, returns penalty + autoLoss flag.
 *
 *   { type: "completion", userId }
 *     → records a successful show completion (no match outcome needed, e.g. cypher/challenge).
 *
 *   { type: "announce", roomId, challengerId, opponentId, challengerScore }
 *     → runs full EventOrchestrator outcome + PA announcement pipeline.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type } = body;

  // ── FINALIZE ─────────────────────────────────────────────────────────────
  if (type === "finalize") {
    const { battleId, winnerId, loserId } = body as {
      battleId: string;
      winnerId: string;
      loserId: string;
    };

    if (!battleId || !winnerId || !loserId) {
      return NextResponse.json(
        { error: "battleId, winnerId, and loserId are required" },
        { status: 400 }
      );
    }

    try {
      const result = await finalizeMatchWithIntegrity(
        battleId,
        winnerId,
        loserId
      );
      return NextResponse.json({ success: true, ...result });
    } catch (err) {
      console.error("[competition/match] finalize failed:", err);
      return NextResponse.json({ error: "Failed to finalize match" }, { status: 500 });
    }
  }

  // ── DISCONNECT / TIMEOUT ─────────────────────────────────────────────────
  if (type === "disconnect") {
    const { userId, streak, isPlatformIssue } = body as {
      userId: string;
      streak: number;
      isPlatformIssue?: boolean;
    };

    if (!userId || typeof streak !== "number") {
      return NextResponse.json(
        { error: "userId and streak (number) are required" },
        { status: 400 }
      );
    }

    try {
      const penalty = await competitionIntegrityEngine.recordTimeout(
        userId,
        streak,
        !!isPlatformIssue
      );
      return NextResponse.json({ success: true, penalty });
    } catch (err) {
      console.error("[competition/match] disconnect penalty failed:", err);
      return NextResponse.json({ error: "Failed to record disconnect" }, { status: 500 });
    }
  }

  // ── COMPLETION (no winner/loser — cypher, challenge, showcase) ────────────
  if (type === "completion") {
    const { userId } = body as { userId: string };

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const ratings = await competitionIntegrityEngine.recordSuccessfulCompletion(userId);
      return NextResponse.json({ success: true, ratings });
    } catch (err) {
      console.error("[competition/match] completion failed:", err);
      return NextResponse.json({ error: "Failed to record completion" }, { status: 500 });
    }
  }

  // ── ANNOUNCE (full orchestrated outcome + PA call-out) ───────────────────
  if (type === "announce") {
    const { roomId, challengerId, opponentId, challengerScore } = body as {
      roomId: string;
      challengerId: string;
      opponentId: string;
      challengerScore: number;
    };

    if (!roomId || !challengerId || !opponentId || typeof challengerScore !== "number") {
      return NextResponse.json(
        { error: "roomId, challengerId, opponentId, and challengerScore are required" },
        { status: 400 }
      );
    }

    try {
      const result = await eventOrchestrator.recordOutcomeAndAnnounce(
        roomId,
        challengerId,
        opponentId,
        challengerScore
      );
      return NextResponse.json({ success: true, ...result });
    } catch (err) {
      console.error("[competition/match] announce failed:", err);
      return NextResponse.json({ error: "Failed to record and announce outcome" }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "Invalid type. Must be: finalize | disconnect | completion | announce" },
    { status: 400 }
  );
}

/**
 * GET /api/competition/match
 *
 * Query variants:
 *   ?userId=...                    → eligibility check (cooldown, integrity warnings)
 *   ?userId=...&type=stats         → full PlayerStats (wins/losses/draws/streak + history)
 *   ?userIdA=...&userIdB=...       → head-to-head match history between two competitors
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const userIdA = req.nextUrl.searchParams.get("userIdA");
  const userIdB = req.nextUrl.searchParams.get("userIdB");
  const type = req.nextUrl.searchParams.get("type");

  // ── HEAD-TO-HEAD ─────────────────────────────────────────────────────────
  if (userIdA && userIdB) {
    try {
      const matches = await matchHistoryEngine.getHeadToHead(userIdA, userIdB);
      return NextResponse.json({ success: true, matches });
    } catch (err) {
      console.error("[competition/match] h2h failed:", err);
      return NextResponse.json({ error: "Failed to fetch head-to-head history" }, { status: 500 });
    }
  }

  if (!userId) {
    return NextResponse.json(
      { error: "userId (or userIdA + userIdB for head-to-head) is required" },
      { status: 400 }
    );
  }

  // ── PLAYER STATS + HISTORY ────────────────────────────────────────────────
  if (type === "stats") {
    try {
      const [eligibility, stats] = await Promise.all([
        eventOrchestrator.validateCompetitor(userId),
        matchHistoryEngine.getPlayerStats(userId),
      ]);
      return NextResponse.json({ success: true, eligibility, stats });
    } catch (err) {
      console.error("[competition/match] stats failed:", err);
      return NextResponse.json({ error: "Failed to fetch player stats" }, { status: 500 });
    }
  }

  // ── ELIGIBILITY CHECK (default) ───────────────────────────────────────────
  try {
    const result = await eventOrchestrator.validateCompetitor(userId);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[competition/match] eligibility check failed:", err);
    return NextResponse.json({ error: "Failed to validate competitor" }, { status: 500 });
  }
}
