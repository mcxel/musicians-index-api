export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const LOOKUP_TO_PRICE: Record<string, string> = {
  starter_plan: process.env.STRIPE_PRICE_FAN_TIER_1 ?? 'price_fan_monthly',
  performer_starter: process.env.STRIPE_PRICE_ARTIST_TIER_1 ?? 'price_artist_monthly',
  diamond_plan: process.env.STRIPE_PRICE_VIP_TIER_1 ?? 'price_vip_monthly',
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const lookupKey = String(formData.get('lookup_key') ?? '').trim();

  if (!lookupKey || !LOOKUP_TO_PRICE[lookupKey]) {
    return NextResponse.redirect(new URL('/pricing?notice=invalid_lookup_key', req.url), 303);
  }

  const priceId = LOOKUP_TO_PRICE[lookupKey];
  const target = new URL(`/api/stripe/checkout?priceId=${encodeURIComponent(priceId)}&mode=subscription`, req.url);
  return NextResponse.redirect(target, 303);
}

export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL('/subscribe', req.url), 303);
}
