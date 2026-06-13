export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';

export async function GET(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.redirect(new URL('/billing?error=stripe-not-configured', req.url));
  }

  const customerId = req.cookies.get('tmi_stripe_customer_id')?.value;
  if (!customerId) {
    return NextResponse.redirect(new URL('/billing?error=no-subscription', req.url));
  }

  const origin = process.env.NEXTAUTH_URL ?? 'https://themusiciansindex.com';

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });
    return NextResponse.redirect(session.url);
  } catch {
    return NextResponse.redirect(new URL('/billing?error=portal-failed', req.url));
  }
}
