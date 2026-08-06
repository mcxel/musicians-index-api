export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const battleId = params.id;
  const body = await req.json();
  const { judgeId, scores, notes } = body;

  if (!judgeId || !scores || !battleId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const totals: Record<string, number> = {};
    for (const [contestantId, criteriaScores] of Object.entries(scores)) {
      totals[contestantId] = Object.values(criteriaScores as Record<string, number>).reduce((a, b) => a + b, 0);
    }

    const sortedContestants = Object.entries(totals).sort(([, a], [, b]) => (b as number) - (a as number));
    const winner = sortedContestants[0]?.[0] ?? null;

    const scorecard = await prisma.battleScorecard.upsert({
      where: { battleId_judgeId: { battleId, judgeId } },
      create: {
        battleId,
        judgeId,
        scores,
        totals,
        winnerId: winner,
        notes: notes ?? null,
      },
      update: {
        scores,
        totals,
        winnerId: winner,
        notes: notes ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      battleId,
      judgeId,
      totals,
      winner,
      scorecardId: scorecard.id,
      message: "Scorecard recorded",
    });
  } catch (error) {
    console.error("[JudgeScorecard] Error:", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const battleId = params.id;

  try {
    const scorecards = await prisma.battleScorecard.findMany({
      where: { battleId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      battleId,
      scorecards: scorecards.map((card) => ({
        id: card.id,
        judgeId: card.judgeId,
        scores: card.scores,
        totals: card.totals,
        winnerId: card.winnerId,
        notes: card.notes,
        createdAt: card.createdAt.getTime(),
        updatedAt: card.updatedAt.getTime(),
      })),
    });
  } catch (error) {
    console.error("[JudgeScorecard] Fetch error:", error);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
