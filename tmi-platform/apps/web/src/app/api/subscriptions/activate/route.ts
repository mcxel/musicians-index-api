export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import EmailQueueEngine from '@/lib/email/EmailQueueEngine';

// Maps Stripe price IDs → TMI subscription tier names
const PRICE_TO_TIER: Record<string, string> = {
  price_fan_monthly:                           'pro',
  price_1TUWI4EL7B8tMf4NHs74ydgc:             'pro',
  price_member_vip_monthly:                    'gold',
  price_artist_monthly:                        'pro',
  price_artist_pro_monthly:                    'pro',
  price_season_pass:                           'platinum',
  price_fan_club_bronze:                       'bronze',
  price_fan_club_silver:                       'silver',
  price_fan_club_gold:                         'gold',
  price_fan_club_platinum:                     'platinum',
};

const COOKIE_OPTS = {
  httpOnly:  true,
  secure:    process.env.NODE_ENV === 'production',
  sameSite:  'lax' as const,
  maxAge:    30 * 24 * 60 * 60, // 30 days
  path:      '/',
};

/**
 * POST /api/subscriptions/activate
 * Called from payment-success page after a successful Stripe subscription checkout.
 * Sets tmi_tier cookie + queues subscription_start email.
 */
export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('tmi_session_id')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  let body: { priceId?: string; email?: string; name?: string } = {};
  try { body = await req.json(); } catch { /* no body */ }

  const { priceId = '', email = '', name = 'Subscriber' } = body;
  const tier = PRICE_TO_TIER[priceId] ?? 'pro';

  // Queue subscription start email if email provided
  if (email) {
    EmailQueueEngine.enqueue({
      to:          email,
      channel:     'billing',
      templateKey: 'subscription_start',
      variables:   { name, tier: tier.toUpperCase(), plan: tier, amount: '9.99', nextBillingDate: getNextBillingDate() },
      required:    true,
      metadata:    { priceId, source: 'subscription_activate' },
    });
  }

  const res = NextResponse.json({ ok: true, tier });
  res.cookies.set('tmi_tier', tier, COOKIE_OPTS);
  return res;
}

function getNextBillingDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
