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
    const body = await req.json() as { itemId: string; itemName: string; price: number; successUrl?: string; cancelUrl?: string };
    const { itemId, itemName, price } = body;

    if (!itemId || !itemName || !price) {
      return NextResponse.json({ error: 'itemId, itemName, and price required' }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const resolvedSuccess = body.successUrl ?? `${origin}/payment-success?type=avatar_item&session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancel  = body.cancelUrl  ?? `${origin}/avatar/shop`;

    if (!isTrustedUrl(resolvedSuccess) || !isTrustedUrl(resolvedCancel)) {
      return NextResponse.json({ error: 'Invalid redirect URL' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(price * 100),
          product_data: {
            name: itemName,
            description: 'TMI Avatar Item',
            metadata: { itemId },
          },
        },
        quantity: 1,
      }],
      success_url: resolvedSuccess,
      cancel_url: resolvedCancel,
      metadata: { itemId, type: 'avatar_item' },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[avatar/purchase]', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
