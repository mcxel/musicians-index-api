import { NextRequest, NextResponse } from 'next/server';
import {
  activateDefaultBots,
  getBotStatus,
  getHealthSummary,
  reactivateBot,
  type ActiveBot,
} from '@/lib/bots/BotActivationEngine';

export const dynamic = 'force-dynamic';

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get('tmi_role')?.value === 'admin';
}

function isSponsorOrSocialOpsBot(bot: ActiveBot): boolean {
  return bot.category === 'PromoBot' || bot.role === 'SPONSOR' || bot.role === 'SOCIAL';
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Admin only' }, { status: 403 });
  }

  activateDefaultBots();
  const allBots = getBotStatus();
  const targetBots = allBots.filter(isSponsorOrSocialOpsBot);

  return NextResponse.json({
    ok: true,
    activeCount: targetBots.filter((bot) => bot.isActive).length,
    totalCount: targetBots.length,
    health: getHealthSummary(),
    bots: targetBots,
  });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Admin only' }, { status: 403 });
  }

  activateDefaultBots();
  const allBots = getBotStatus();
  const targetBots = allBots.filter(isSponsorOrSocialOpsBot);

  let reactivated = 0;
  for (const bot of targetBots) {
    if (!bot.isActive) {
      if (reactivateBot(bot.id)) {
        reactivated += 1;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    message: 'Sponsor and social operations bot lane activated',
    totalTargetBots: targetBots.length,
    reactivated,
    activeAfter: getBotStatus().filter((bot) => isSponsorOrSocialOpsBot(bot) && bot.isActive).length,
    health: getHealthSummary(),
  });
}
