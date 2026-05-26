export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  const stripe = getStripe();

  if (!key) {
    return NextResponse.json({ ok: false, reason: 'STRIPE_SECRET_KEY not set' });
  }

  const keyPreview = `${key.slice(0, 8)}...${key.slice(-4)}`;
  const hasLeadingSpace = key !== key.trim();

  if (!stripe) {
    return NextResponse.json({ ok: false, reason: 'getStripe() returned null', keyPreview, hasLeadingSpace });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: 100,
          product_data: { name: 'TMI Diagnostic Test' },
        },
      }],
      success_url: 'https://themusiciansindex.com/payment-success',
      cancel_url: 'https://themusiciansindex.com/season-pass',
    });
    return NextResponse.json({ ok: true, sessionId: session.id, keyPreview, hasLeadingSpace, mode: 'payment' });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      reason: String(err),
      keyPreview,
      hasLeadingSpace,
    });
  }
}
