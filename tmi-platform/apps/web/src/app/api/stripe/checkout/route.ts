export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { getRegion, getRegionalPriceId, SUBSCRIPTION_TIERS } from '@/lib/stripe/regionalPricing';

function isStripePaused(): boolean {
  return process.env.STRIPE_PAUSE_MODE === 'true';
}
// Reverse-map a Tier 1 pricing page priceId to a product key for regional resolution
function resolveRegionalPriceId(requestedPriceId: string, req: NextRequest): string {
  const country = req.headers.get('x-vercel-ip-country');
  const region = getRegion(country);
  if (region === 'TIER_1') return requestedPriceId;

  // Find which subscription tier this priceId belongs to
  const match = SUBSCRIPTION_TIERS.find(
    (t) => t.tier1PriceId === requestedPriceId || (process.env[`STRIPE_PRICE_${t.key}_TIER_1`] ?? t.tier1PriceId) === requestedPriceId,
  );
  if (!match) return requestedPriceId; // non-subscription price — pass through as-is
  return getRegionalPriceId(match.tier1PriceId, match.key, region);
}

// GET /api/stripe/checkout?priceId=...&mode=subscription|payment
// Used by season pass and credits CTA links — creates a session and redirects
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const priceId = searchParams.get('priceId');
  const mode = (searchParams.get('mode') ?? 'subscription') as 'subscription' | 'payment';

  if (!priceId) {
    return NextResponse.redirect(new URL('/season-pass', req.url));
  }

  if (isStripePaused()) {
    return NextResponse.redirect(new URL('/season-pass?notice=stripe-paused', req.url));
  }

  const stripe = getStripe();
  if (!stripe) {
    // STRIPE_SECRET_KEY not set — send back with a banner notice
    return NextResponse.redirect(new URL('/season-pass?notice=stripe-pending', req.url));
  }

  const resolvedPriceId = resolveRegionalPriceId(priceId, req);

  // Battle sponsor passthrough params
  const battleId    = searchParams.get('battleId');
  const sponsorTier = searchParams.get('sponsorTier');
  const sponsorName = searchParams.get('sponsorName') ?? 'Battle Sponsor';

  // Build success URL — include sponsor params so payment-success can auto-attach
  let successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&priceId=${resolvedPriceId}&mode=${mode}`;
  if (battleId) {
    successUrl += `&battleId=${encodeURIComponent(battleId)}`;
    if (sponsorTier) successUrl += `&sponsorTier=${encodeURIComponent(sponsorTier)}&sponsorName=${encodeURIComponent(sponsorName)}`;
  }
  const cancelUrl = battleId ? `${origin}/sponsor/battles?notice=checkout-cancelled` : `${origin}/season-pass`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url:  cancelUrl,
      allow_promotion_codes: true,
      ...(battleId && {
        metadata: { battleId, sponsorTier: sponsorTier ?? 'FEATURED', sponsorName, type: 'battle-sponsor' },
      }),
    });
    if (!session.url) throw new Error('No session URL returned');
    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('[stripe/checkout:GET]', err);
    return NextResponse.redirect(new URL('/season-pass?notice=checkout-error', req.url));
  }
}

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
  if (isStripePaused()) {
    return NextResponse.json({
      paused: true,
      message: "Payments are temporarily processing — your request is saved and will be fulfilled shortly.",
    }, { status: 503 });
  }
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

    if (!isTrustedRedirectUrl(successUrl) || !isTrustedRedirectUrl(cancelUrl)) {
      console.error('[stripe/checkout] Rejected untrusted redirect URL', { successUrl, cancelUrl });
      return NextResponse.json({ error: 'Invalid redirect URL' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    // Try upstream API first (non-fatal — falls back to direct Stripe SDK)
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase) {
      try {
        const idempotencyKey =
          (req.headers.get("idempotency-key") ?? null) ||
          `checkout_${Buffer.from(JSON.stringify(items)).toString("base64url").slice(0, 32)}_${Date.now()}`;
        const upstream = await fetch(`${apiBase}/stripe/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
          body: JSON.stringify({ items, successUrl, cancelUrl }),
          signal: AbortSignal.timeout(CHECKOUT_TIMEOUT_MS),
        });
        if (upstream.ok) {
          const data = await upstream.json();
          return NextResponse.json(data);
        }
        console.error(`[stripe/checkout:POST] Upstream ${upstream.status} — falling back to direct SDK`);
      } catch (upstreamErr) {
        console.error('[stripe/checkout:POST] Upstream unreachable — falling back to direct SDK:', upstreamErr);
      }
    }

    // Direct Stripe SDK fallback
    const session = await stripe.checkout.sessions.create({
      mode: items.length === 1 ? 'payment' : 'payment',
      line_items: items.map(i => ({ price: i.priceId, quantity: i.quantity ?? 1 })),
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    if (!session.url) throw new Error('No session URL from Stripe');
    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      console.error('[stripe/checkout] Upstream timeout');
      return NextResponse.json({ error: 'Checkout service timeout' }, { status: 504 });
    }
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
