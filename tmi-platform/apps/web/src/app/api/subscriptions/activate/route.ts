export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import EmailQueueEngine from '@/lib/email/EmailQueueEngine';

// Maps Stripe price IDs → TMI subscription tier names
const PRICE_TO_TIER: Record<string, string> = {
  // Fan tiers (real Stripe IDs)
  'price_1TcJXrEAwH1Fjtu9pYxAwEqi': 'FREE',
  'price_1TcJnFEAwH1Fjtu98MhoEGqG': 'RUBY',
  'price_1TcJoOEAwH1Fjtu9IrhSwoyA': 'SILVER',
  'price_1TcJrTEAwH1Fjtu9wjhmnv5K': 'GOLD',
  'price_1TcJsDEAwH1Fjtu9zU7X7mml': 'PLATINUM',
  'price_1TcJvaEAwH1Fjtu9me4Aq2UU': 'DIAMOND',
  'price_1TcJxBEAwH1Fjtu9xjMfLhw4': 'GOLD',
  // Performer tiers
  'price_1TcJzdEAwH1Fjtu9Nx5DsRzL': 'RUBY',
  'price_1TcK0dEAwH1Fjtu9MXK323Q7': 'SILVER',
  'price_1TcK1LEAwH1Fjtu9ZnOrTyZw': 'GOLD',
  'price_1TcK2xEAwH1Fjtu9FLlIHItH': 'PLATINUM',
  'price_1TcK4MEAwH1Fjtu96b2TJlBe': 'DIAMOND',
  'price_1TcK68EAwH1Fjtu9KGLcf8HE': 'GOLD',
  // Sponsor/Advertiser/Venue/Promoter
  'price_1Tb148EAwH1Fjtu9KZFL3H3Y': 'RUBY',
  'price_1Tb147EAwH1Fjtu9yCbRfH3j': 'SILVER',
  'price_1Tb144EAwH1Fjtu9I0Xq1iFV': 'GOLD',
  'price_1Tb143EAwH1Fjtu9WDqnYV7z': 'DIAMOND',
  'price_1TdZQEEAwH1Fjtu9JcPS32sL': 'PRO',
  'price_1TdZQSEAwH1Fjtu9Cz3j2Rik': 'PRO',
  'price_1TdY0UEAwH1Fjtu9FTrdprdy': 'GOLD',
  // Legacy placeholder IDs (backwards compat)
  price_fan_monthly:        'SILVER',
  price_artist_monthly:     'GOLD',
  price_vip_monthly:        'DIAMOND',
  price_season_pass:        'PLATINUM',
  price_fan_club_RUBY:      'RUBY',
  price_fan_club_silver:    'SILVER',
  price_fan_club_gold:      'GOLD',
  price_fan_club_platinum:  'PLATINUM',
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
