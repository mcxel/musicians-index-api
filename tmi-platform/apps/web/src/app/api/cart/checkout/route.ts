export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidateForCheckout } from '@/lib/commerce/CartService';

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const sessionId = req.cookies.get('tmi_session_id')?.value ?? '';
  const email = req.cookies.get('tmi_user_email')?.value ?? '';
  if (!sessionId && !email) return null;
  const user = await prisma.user.findFirst({
    where: { OR: [...(sessionId ? [{ id: sessionId }] : []), ...(email ? [{ email }] : [])] },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * POST /api/cart/checkout — turns the persistent cart into a real Stripe
 * session using the SAME checkout infrastructure BUY NOW already uses
 * (/api/store/checkout's POST items[] path — same catalog, price authority,
 * order system, Stripe session, webhook, and entitlement fulfillment; not a
 * second checkout implementation).
 *
 * Always revalidates server-side first — if anything in the cart changed
 * price or dropped out of the catalog since it was added, this returns 409
 * with the details instead of silently charging the new price. The caller
 * must show that to the user and let them decide before retrying.
 */
export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const revalidation = await revalidateForCheckout(userId);
  if (!revalidation.ok) {
    return NextResponse.json(
      { ok: false, error: 'cart_items_unavailable', unavailable: revalidation.unavailable },
      { status: 409 },
    );
  }
  if (revalidation.changed.length > 0) {
    return NextResponse.json(
      { ok: false, error: 'cart_prices_changed', changed: revalidation.changed },
      { status: 409 },
    );
  }
  if (revalidation.items.length === 0) {
    return NextResponse.json({ ok: false, error: 'cart_empty' }, { status: 400 });
  }

  const { origin } = req.nextUrl;
  // /api/store/checkout owns its own success/cancel URLs — only items[] is
  // forwarded, in the exact { itemId, qty } shape it (and the webhook's
  // metadata.items parsing) already expects.
  const upstream = await fetch(`${origin}/api/store/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Forward the session so the shared checkout route resolves the same
      // authenticated buyer this route already verified.
      cookie: req.headers.get('cookie') ?? '',
    },
    body: JSON.stringify({ items: revalidation.items }),
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
