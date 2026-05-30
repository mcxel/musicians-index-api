export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { validateSessionToken } from '@/lib/auth/SessionManager';
import { getUserByEmail } from '@/lib/auth/UserStore';

const TIER_FEATURES: Record<string, string[]> = {
  free:     ['Basic access', 'Community chat', 'Vote in contests'],
  pro:      ['Everything in Free', 'HD livestream access', 'Priority queue'],
  silver:   ['Everything in Pro', '2× XP earning', 'Early room access'],
  gold:     ['Everything in Silver', 'Vote boost 2×', 'Sponsor slot eligible', 'Homepage feature'],
  platinum: ['Everything in Gold', 'Artist collaboration tools', 'Revenue share eligible'],
  diamond:  ['Everything in Platinum', 'VIP backstage access', 'NFT drops', 'Direct artist DMs'],
};

export async function GET(req: NextRequest) {
  const sessionId  = req.cookies.get('tmi_session_id')?.value;
  const sessionTok = req.cookies.get('tmi_session')?.value;
  const email      = req.cookies.get('tmi_user_email')?.value;

  if (!sessionId || !sessionTok) {
    return NextResponse.json({ authenticated: false, tier: 'free' }, { status: 200 });
  }

  const clientIp = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { valid } = await validateSessionToken(sessionTok, sessionId, clientIp);
  if (!valid) {
    return NextResponse.json({ authenticated: false, tier: 'free' }, { status: 200 });
  }

  const user = email ? getUserByEmail(email) : null;
  const tier = (user?.tier ?? req.cookies.get('tmi_tier')?.value ?? 'free').toLowerCase();
  const features = TIER_FEATURES[tier] ?? TIER_FEATURES.free!;

  return NextResponse.json({
    authenticated: true,
    userId: user?.id ?? null,
    tier,
    tierDisplay: tier.charAt(0).toUpperCase() + tier.slice(1),
    features,
    isGold:     ['gold', 'platinum', 'diamond'].includes(tier),
    isPlatinum: ['platinum', 'diamond'].includes(tier),
    isDiamond:  tier === 'diamond',
  });
}
