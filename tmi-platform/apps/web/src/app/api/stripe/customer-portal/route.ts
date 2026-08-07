export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/stripe/customer-portal
 * Opens Stripe Billing Portal when customer id is known.
 * Honest empty/error redirects — never fake a portal session.
 */
export async function GET(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.redirect(new URL('/billing?error=stripe-not-configured', req.url));
  }

  let customerId = req.cookies.get('tmi_stripe_customer_id')?.value;
  const email = req.cookies.get('tmi_user_email')?.value?.toLowerCase();

  if (!customerId && email) {
    const user = await prisma.user
      .findFirst({
        where: { email },
        select: { stripeCustomerId: true },
      })
      .catch(() => null);
    customerId = user?.stripeCustomerId ?? undefined;
  }

  if (!customerId) {
    return NextResponse.redirect(new URL('/billing?error=no-subscription', req.url));
  }

  const origin = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://themusiciansindex.com';

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });
    if (!session.url) {
      return NextResponse.redirect(new URL('/billing?error=portal-unavailable', req.url));
    }
    return NextResponse.redirect(session.url);
  } catch (err) {
    console.error('[stripe/customer-portal]', err);
    return NextResponse.redirect(new URL('/billing?error=portal-failed', req.url));
  }
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { ok: false, error: 'Payments not configured', code: 'STRIPE_NOT_CONFIGURED' },
      { status: 503 },
    );
  }

  let customerId = req.cookies.get('tmi_stripe_customer_id')?.value;
  const email = req.cookies.get('tmi_user_email')?.value?.toLowerCase();
  if (!customerId && email) {
    const user = await prisma.user
      .findFirst({ where: { email }, select: { stripeCustomerId: true } })
      .catch(() => null);
    customerId = user?.stripeCustomerId ?? undefined;
  }

  if (!customerId) {
    return NextResponse.json(
      { ok: false, error: 'No Stripe customer on file. Subscribe first.' },
      { status: 404 },
    );
  }

  const origin = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://themusiciansindex.com';
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });
    if (!session.url) {
      return NextResponse.json({ ok: false, error: 'Portal unavailable' }, { status: 502 });
    }
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Portal failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
