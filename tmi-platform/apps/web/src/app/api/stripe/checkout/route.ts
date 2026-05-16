export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const CHECKOUT_TIMEOUT_MS = 10_000;
const TRUSTED_HOSTS = new Set([
  "themusiciansindex.com",
  "www.themusiciansindex.com",
  "localhost",
]);

function isTrustedRedirectUrl(raw: string): boolean {
  if (raw.startsWith("/")) return true; // relative path always safe
  try {
    const url = new URL(raw);
    return TRUSTED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

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

    if (!successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'successUrl and cancelUrl required' }, { status: 400 });
    }

    // Prevent open redirects — successUrl/cancelUrl must be relative or on a trusted domain
    if (!isTrustedRedirectUrl(successUrl) || !isTrustedRedirectUrl(cancelUrl)) {
      console.error('[stripe/checkout] Rejected untrusted redirect URL', { successUrl, cancelUrl });
      return NextResponse.json({ error: 'Invalid redirect URL' }, { status: 400 });
    }

    // Idempotency key: client may pass one, otherwise we derive from items hash
    const idempotencyKey =
      (req.headers.get("idempotency-key") ?? null) ||
      `checkout_${Buffer.from(JSON.stringify(items)).toString("base64url").slice(0, 32)}_${Date.now()}`;

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'https://tmi-api.themusiciansindex.com';
    const res = await fetch(`${apiBase}/stripe/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ items, successUrl, cancelUrl }),
      signal: AbortSignal.timeout(CHECKOUT_TIMEOUT_MS),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[stripe/checkout] Upstream ${res.status}:`, err);
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      console.error('[stripe/checkout] Upstream timeout');
      return NextResponse.json({ error: 'Checkout service timeout' }, { status: 504 });
    }
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
