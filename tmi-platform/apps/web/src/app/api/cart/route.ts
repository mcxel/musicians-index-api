export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCart } from '@/lib/commerce/CartService';

/** Resolves the authenticated user the same way /api/account/purchases does. */
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

/** GET /api/cart — the authenticated user's persistent cart. Honest empty for guests. */
export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ authenticated: false, items: [], subtotalCents: 0, itemCount: 0 });
  }
  const cart = await getCart(userId);
  return NextResponse.json({ authenticated: true, ...cart });
}
