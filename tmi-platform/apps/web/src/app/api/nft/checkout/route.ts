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
    const body = await req.json() as { nftId: string; title: string; amount: number; edition: string; successUrl?: string; cancelUrl?: string };
    const { nftId, title, amount, edition, successUrl, cancelUrl } = body;

    if (!nftId || !title || !amount) {
      return NextResponse.json({ error: 'nftId, title, and amount required' }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const resolvedSuccess = successUrl ?? `${origin}/nft-marketplace?status=purchased&nft=${nftId}`;
    const resolvedCancel  = cancelUrl  ?? `${origin}/nft-marketplace`;

    if (!isTrustedUrl(resolvedSuccess) || !isTrustedUrl(resolvedCancel)) {
      return NextResponse.json({ error: 'Invalid redirect URL' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: title,
            description: `TMI NFT — Edition ${edition}`,
            metadata: { nftId },
          },
        },
        quantity: 1,
      }],
      success_url: `${resolvedSuccess}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: resolvedCancel,
      metadata: { nftId, type: 'nft' },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[nft/checkout]', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
