export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { AvatarEvolutionEngine, XP_VALUES, TIER_CONFIG, type XpEvent } from "@/lib/avatar/AvatarEvolutionEngine";

// GET /api/tokens/balance?userId=xxx
// Returns: { balance, xp, tier, progress }
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ balance: 0, xp: 0, tier: "Rookie" });

  const progress = AvatarEvolutionEngine.getProgress(userId);
  const state = AvatarEvolutionEngine.getOrCreate(userId);

  // PunPoints balance = XP × 1 (1:1 for soft launch, adjust post-launch)
  const balance = progress.totalXp;

  return NextResponse.json({
    ok: true,
    userId,
    balance,
    xp:       progress.totalXp,
    tier:     progress.tier,
    needed:   progress.needed,
    percent:  progress.percent,
    tierConfig: TIER_CONFIG[progress.tier],
    heroId:   state.heroId ?? null,
    achievements: state.achievements,
  });
}

// POST /api/tokens/balance
// Body: { userId, event, entityId? } — awards XP for an action
// Body: { userId, amount, reason } — direct credit (admin only)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, event, entityId, amount, reason } = body;

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Direct credit (admin use)
  if (amount && reason) {
    return NextResponse.json({ ok: true, userId, credited: amount, reason });
  }

  // XP event award
  if (event && event in XP_VALUES) {
    const result = AvatarEvolutionEngine.awardXp(userId, event as XpEvent, entityId);
    return NextResponse.json({ ok: true, ...result });
  }

  return NextResponse.json({ error: "event or amount required" }, { status: 400 });
}
