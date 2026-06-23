export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { revenueFirstRewardsGovernor } from '@/lib/economy/RevenueFirstRewardsGovernor';
import { seedRoomWithBots } from '@/lib/live/audienceRuntimeEngine';
import { botCrowdFillEngine } from '@/lib/live/BotCrowdFillEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      challengerId?: string;
      targetId?: string;
      format?: string;
      genre?: string;
      message?: string;
      wagerXp?: number;
      expectedRevenueCents?: number;
      expectedOperatingCostCents?: number;
      expectedInfrastructureCostCents?: number;
      expectedPrizePoolCents?: number;
    };

    const { challengerId, targetId, format, genre, message, wagerXp } = body;

    if (!challengerId || !targetId) {
      return NextResponse.json({ ok: false, error: 'challengerId and targetId required' }, { status: 400 });
    }

    const economics = revenueFirstRewardsGovernor.assessEventEconomics({
      expectedRevenueCents: Math.max(0, Number(body.expectedRevenueCents ?? 0)),
      expectedOperatingCostCents: Math.max(0, Number(body.expectedOperatingCostCents ?? 0)),
      expectedInfrastructureCostCents: Math.max(0, Number(body.expectedInfrastructureCostCents ?? 0)),
      expectedPrizePoolCents: Math.max(0, Number(body.expectedPrizePoolCents ?? 0)),
    });

    if (!economics.allowed) {
      return NextResponse.json({
        ok: false,
        error: 'Challenge creation rejected by revenue governor',
        code: 'EVENT_ECONOMICS_GATE_REJECTED',
        economics,
      }, { status: 409 });
    }

    // Challenge is queued — actual Battle DB record is created on acceptance
    const challengeId = `chal_${challengerId}_${targetId}_${Date.now()}`;
    const battleRoomId = `battle-${challengeId}`;

    // Seed audience bots so the battle room never looks empty when it opens.
    // Rule 15: progressive fill, max 92% of seats.
    seedRoomWithBots(battleRoomId, 15);
    botCrowdFillEngine.activate({
      roomId: battleRoomId,
      minimumFillRatio: 0.4,
      minimumRealThreshold: 3,
      maxBotCount: 46, // 92% of a 50-seat battle room
    });
    botCrowdFillEngine.startActivity(battleRoomId);

    return NextResponse.json({
      ok: true,
      challengeId,
      battleRoomId,
      status: 'pending_acceptance',
      details: { format: format ?? 'freestyle', genre: genre ?? 'Hip-Hop', message: message ?? '', wagerXp: wagerXp ?? 50 },
      economics,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid request' }, { status: 400 });
  }
}
