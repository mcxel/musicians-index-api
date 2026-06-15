export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { updateUserTier } from '@/lib/auth/UserStore';
import { prisma } from '@/lib/prisma';
import type { UserTier } from '@/lib/auth/UserStore';

function tierFromPriceId(priceId: string): UserTier {
  const map: Record<string, UserTier> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_RUBY      ?? 'price_fan_ruby']:         'RUBY',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_SILVER    ?? 'price_fan_silver']:       'SILVER',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_GOLD      ?? 'price_fan_gold']:         'GOLD',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_PLATINUM  ?? 'price_fan_platinum']:     'PLATINUM',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_DIAMOND   ?? 'price_fan_diamond']:      'DIAMOND',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FAMILY    ?? 'price_fan_family']:       'DIAMOND',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_RUBY     ?? 'price_perf_ruby']:   'RUBY',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_SILVER   ?? 'price_perf_silver']: 'SILVER',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_GOLD     ?? 'price_perf_gold']:   'GOLD',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_PLATINUM ?? 'price_perf_plat']:   'PLATINUM',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_DIAMOND  ?? 'price_perf_diamond']:'DIAMOND',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_BAND     ?? 'price_perf_band']:   'DIAMOND',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_BASIC    ?? 'price_sponsor_basic']:   'PRO',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_STANDARD ?? 'price_sponsor_std']:     'GOLD',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_PREMIUM  ?? 'price_sponsor_premium']: 'PLATINUM',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_DIAMOND  ?? 'price_sponsor_diamond']: 'DIAMOND',
  };
  return map[priceId] ?? 'PRO';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { priceId?: string };
    const priceId = body.priceId ?? '';
    const email = req.cookies.get('tmi_user_email')?.value ?? '';

    if (!email) {
      return NextResponse.json({ ok: false, error: 'not authenticated' }, { status: 401 });
    }

    const tier = tierFromPriceId(priceId);

    updateUserTier(email, tier);

    prisma.user.updateMany({
      where: { email: email.toLowerCase() },
      data: { tier },
    }).catch(() => undefined);

    const res = NextResponse.json({ ok: true, tier });
    res.cookies.set('tmi_tier', tier, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('[subscriptions/activate]', err);
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 });
  }
}
