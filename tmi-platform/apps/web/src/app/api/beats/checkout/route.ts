export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';

const TRUSTED_HOSTS = new Set(['themusiciansindex.com', 'www.themusiciansindex.com', 'localhost']);

function isTrustedUrl(raw: string): boolean {
  if (raw.startsWith('/')) return true;
  try { return TRUSTED_HOSTS.has(new URL(raw).hostname); } catch { return false; }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      beatId: string; title: string; producer: string;
      license: string; amount: number; bpm?: number; key?: string;
      successUrl?: string; cancelUrl?: string;
    };
    const { beatId, title, producer, license, amount, bpm, key, successUrl, cancelUrl } = body;

    if (!beatId || !title || !amount) {
      return NextResponse.json({ error: 'beatId, title, and amount required' }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const resolvedSuccess = successUrl ?? `${origin}/payment-success?type=beat&session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancel  = cancelUrl  ?? `${origin}/beat-marketplace`;

    if (!isTrustedUrl(resolvedSuccess) || !isTrustedUrl(resolvedCancel)) {
      return NextResponse.json({ error: 'Invalid redirect URL' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
    }

    const desc = [bpm ? `${bpm} BPM` : '', key ?? '', `License: ${license}`].filter(Boolean).join(' · ');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `"${title}" by ${producer}`,
            description: desc,
            metadata: { beatId, license },
          },
        },
        quantity: 1,
      }],
      success_url: resolvedSuccess.replace('{CHECKOUT_SESSION_ID}', '{CHECKOUT_SESSION_ID}'),
      cancel_url: resolvedCancel,
      metadata: { beatId, license, type: 'beat' },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[beats/checkout]', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
