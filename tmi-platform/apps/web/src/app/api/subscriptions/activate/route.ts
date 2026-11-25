export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe/client';
import { tierForPriceId } from '@/lib/stripe/tierMapping';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';

// Revenue protection guardrail: this endpoint exists so the payment-success
// page can confirm a tier upgrade has landed (the Stripe webhook is the
// actual grant path). It must NEVER grant a tier from a client-supplied
// priceId — that field is attacker-controlled and the price IDs themselves
// are NEXT_PUBLIC_ env vars, visible in the browser bundle. This route verifies
// a paid Checkout Session against the entitlement committed by the webhook.
//
// P0 security fix (2026-11-17): identity previously came from the
// client-settable tmi_user_email cookie. See
// CLAUDE_P0_SESSION_FORGERY_FINDING_2026-11-17.md. The Stripe-session
// ownership check below already narrowed the practical exploit (the
// session's billing email had to match), but a browser-supplied email must
// never be the identity source for a tier grant regardless — identity now
// comes from a validated session.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { sessionId?: string };
    const sessionId = (body.sessionId ?? '').trim();
    const auth = await getTmiAuth();
    const email = auth?.user.email ?? '';

    if (!email) {
      return NextResponse.json({ ok: false, error: 'not authenticated' }, { status: 401 });
    }
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: 'missing sessionId' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ ok: false, error: 'payments not configured' }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid' || session.status !== 'complete') {
      return NextResponse.json({ ok: false, error: 'payment not confirmed' }, { status: 402 });
    }

    const sessionEmail = (session.customer_details?.email ?? session.customer_email ?? '').toLowerCase().trim();
    if (!sessionEmail || sessionEmail !== email.toLowerCase().trim()) {
      return NextResponse.json({ ok: false, error: 'session does not match authenticated user' }, { status: 403 });
    }

    const subscription = session.subscription;
    if (session.mode !== 'subscription' || typeof subscription !== 'object' || !subscription ||
        (subscription.status !== 'active' && subscription.status !== 'trialing')) {
      return NextResponse.json({ ok: false, error: 'subscription not active' }, { status: 402 });
    }
    const priceId = typeof subscription === 'object' && subscription !== null
      ? subscription.items.data[0]?.price?.id ?? ''
      : '';

    const tier = tierForPriceId(priceId);
    if (!tier) {
      return NextResponse.json({ ok: false, error: 'unrecognized price' }, { status: 422 });
    }

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() },
      select: { tier: true, stripeSubscriptionId: true, stripePriceId: true },
    });
    if (!user || user.tier !== tier || user.stripeSubscriptionId !== subscription.id || user.stripePriceId !== priceId) {
      return NextResponse.json({ ok: false, error: 'subscription activation pending' }, { status: 409 });
    }

    const res = NextResponse.json({ ok: true, tier });
    res.cookies.set('tmi_tier', tier, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    // Set Stripe customer ID cookie so the customer portal can redirect properly
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : '';
    if (stripeCustomerId) {
      res.cookies.set('tmi_stripe_customer_id', stripeCustomerId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year — customer ID is stable
        path: '/',
      });
    }

    return res;
  } catch (err) {
    console.error('[subscriptions/activate]', err);
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 });
  }
}
