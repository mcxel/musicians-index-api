export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { updateUserTier } from '@/lib/auth/UserStore';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe/client';
import { tierForPriceId } from '@/lib/stripe/tierMapping';

// Revenue protection guardrail: this endpoint exists so the payment-success
// page can confirm a tier upgrade has landed (the Stripe webhook is the
// actual grant path). It must NEVER grant a tier from a client-supplied
// priceId — that field is attacker-controlled and the price IDs themselves
// are NEXT_PUBLIC_ env vars, visible in the browser bundle. Every grant here
// is re-derived server-side from a real, paid Stripe Checkout Session.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { sessionId?: string };
    const sessionId = (body.sessionId ?? '').trim();
    const email = req.cookies.get('tmi_user_email')?.value ?? '';

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

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ ok: false, error: 'payment not confirmed' }, { status: 402 });
    }

    const sessionEmail = (session.customer_details?.email ?? session.customer_email ?? '').toLowerCase().trim();
    if (!sessionEmail || sessionEmail !== email.toLowerCase().trim()) {
      return NextResponse.json({ ok: false, error: 'session does not match authenticated user' }, { status: 403 });
    }

    const subscription = session.subscription;
    const priceId = typeof subscription === 'object' && subscription !== null
      ? subscription.items.data[0]?.price?.id ?? ''
      : '';

    const tier = tierForPriceId(priceId);
    if (!tier) {
      return NextResponse.json({ ok: false, error: 'unrecognized price' }, { status: 422 });
    }

    updateUserTier(email, tier);

    await prisma.user.updateMany({
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
