import { NextRequest, NextResponse } from 'next/server';

// Stripe webhooks are handled by the NestJS API (which holds STRIPE_WEBHOOK_SECRET).
// This proxy route is provided for environments where the web domain is the public
// endpoint, forwarding raw body bytes to the NestJS service.
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.arrayBuffer();
    const stripeSignature = req.headers.get('stripe-signature') ?? '';

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://tmi-api.themusiciansindex.com';
    const res = await fetch(`${apiBase}/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature,
      },
      body: rawBody,
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Webhook forwarding failed' }, { status: res.status });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe/webhook]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
