import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const battleId = params.id;
  const body = await req.json();
  const { judgeId, scores, notes } = body;

  if (!judgeId || !scores || !battleId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    // TODO: Save to DB: await prisma.battleScorecard.create({ data: { battleId, judgeId, scores, notes } });
    const totals: Record<string, number> = {};
    for (const [contestantId, criteriaScores] of Object.entries(scores)) {
      totals[contestantId] = Object.values(criteriaScores as Record<string, number>).reduce((a, b) => a + b, 0);
    }

    const sortedContestants = Object.entries(totals).sort(([, a], [, b]) => (b as number) - (a as number));
    const winner = sortedContestants[0]?.[0] ?? null;

    return NextResponse.json({
      success: true,
      battleId,
      judgeId,
      totals,
      winner,
      message: "Scorecard recorded",
    });
  } catch (error) {
    console.error("[JudgeScorecard] Error:", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const battleId = params.id;
  // TODO: Fetch all scorecards for this battle from DB
  return NextResponse.json({
    battleId,
    scorecards: [],
    message: "No scorecards found (DB integration pending)",
  });
}
