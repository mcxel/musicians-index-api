export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getAllUsers, getUserCount } from '@/lib/auth/UserStore';
import { getRecentEvents } from '@/lib/stripe/stripe-telemetry-store';

function getUserFromRequest(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value ?? '';
  if (!email) return null;
  return getUserByEmail(email);
}

function startOfDayMs(): number {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime();
}
function startOfMonthMs(): number {
  const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime();
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dayStart = startOfDayMs();
  const monthStart = startOfMonthMs();
  const allUsers = getAllUsers(1000);
  const totalUsers = getUserCount();

  const revenueEvents = getRecentEvents(500);
  let revenueToday = 0;
  let revenueMonth = 0;
  for (const ev of revenueEvents) {
    const amount = Number(ev.meta?.amountCents ?? 0) / 100;
    if (ev.ts >= dayStart) revenueToday += amount;
    if (ev.ts >= monthStart) revenueMonth += amount;
  }

  const role = user.role;

  const BASE_STATS = {
    totalUsers,
    newToday: allUsers.filter(u => u.createdAt >= dayStart).length,
    paidMembers: allUsers.filter(u => u.tier !== 'FREE').length,
    revenueToday,
    revenueMonth,
    revenueEvents: revenueEvents.length,
  };

  const roleStats: Record<string, Record<string, unknown>> = {
    fan:        { xpPoints: 0, battlesWatched: 0, tipsSent: 0, badgesEarned: 0, roomsVisited: 0 },
    artist:     { beatPlays: 0, beatsSold: 0, nftsMinted: 0, revenue: 0, followers: 0, monthlyListeners: 0 },
    performer:  { showsDone: 0, battleWins: 0, totalTips: 0, xpRank: '—', liveSessions: 0 },
    sponsor:    { activeCampaigns: 0, totalPlacements: 0, giveawaysRun: 0, totalSpend: 0, reach: 0 },
    advertiser: { activeAds: 0, impressions: 0, clicks: 0, adSpend: 0, ctr: '0%', roas: '—' },
    venue:      { eventsHosted: 0, ticketsSold: 0, artistsBooked: 0, revenue: 0, capacity: 0 },
    promoter:   { eventsPromoted: 0, artistsBooked: 0, ticketsSold: 0, revenue: 0, reach: 0 },
    writer:     { articlesWritten: 0, totalViews: 0, comments: 0, featured: 0, wordCount: 0 },
    admin:      { ...BASE_STATS },
  };

  const myStats = roleStats[role] ?? roleStats.fan;
  const tier = user.tier;

  // Tier-gated analytics depth
  const analyticsDepth =
    tier === 'DIAMOND' ? 'full' :
    tier === 'PLATINUM' ? 'advanced' :
    tier === 'GOLD'     ? 'professional' :
    tier === 'SILVER'   ? 'standard' :
    tier === 'RUBY'   ? 'basic' :
    tier === 'PRO'      ? 'basic' :
    'minimal';

  return NextResponse.json({
    userId: user.id,
    role,
    tier,
    analyticsDepth,
    stats: myStats,
    platform: analyticsDepth !== 'minimal' ? BASE_STATS : undefined,
    generatedAt: new Date().toISOString(),
  });
}
