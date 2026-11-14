export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma, { isPrismaTableMissingError } from '@/lib/prisma';
import { getCart } from '@/lib/commerce/CartService';

/** Resolves the authenticated user the same way /api/account/purchases does. */
async function resolveUserId(req: NextRequest): Promise<string | null> {
  try {
    const sessionId = req.cookies.get('tmi_session_id')?.value ?? '';
    const email = req.cookies.get('tmi_user_email')?.value ?? '';
    if (!sessionId && !email) return null;
    const user = await prisma.user.findFirst({
      where: { OR: [...(sessionId ? [{ id: sessionId }] : []), ...(email ? [{ email }] : [])] },
      select: { id: true },
    }).catch(() => null);
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** GET /api/cart — the authenticated user's persistent cart. Honest empty for guests. */
export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ authenticated: false, items: [], subtotalCents: 0, itemCount: 0 });
    }
    const cart = await getCart(userId);
    return NextResponse.json({ authenticated: true, ...cart });
  } catch (err: unknown) {
    if (isPrismaTableMissingError(err, 'cart')) {
      console.warn('[api/cart] CART_DEGRADED_MODE: CART_SCHEMA_UNAVAILABLE in route GET. Returning 200 with degraded empty cart.');
      return NextResponse.json({
        authenticated: true,
        items: [],
        subtotalCents: 0,
        itemCount: 0,
        degradedMode: true,
        degradedReason: 'CART_SCHEMA_UNAVAILABLE',
      });
    }
    console.error('[api/cart] UNEXPECTED_SERVER_ERROR in GET /api/cart:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
