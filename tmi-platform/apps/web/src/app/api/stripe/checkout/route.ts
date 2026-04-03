import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, successUrl, cancelUrl } = body as {
      items: { priceId: string; quantity?: number }[];
      successUrl: string;
      cancelUrl: string;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items required' }, { status: 400 });
    }

    // Forward to NestJS API which holds the Stripe secret key
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://tmi-api.themusiciansindex.com';
    const res = await fetch(`${apiBase}/stripe/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, successUrl, cancelUrl }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
