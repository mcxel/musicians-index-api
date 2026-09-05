export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addItem, setQuantity, removeItem } from '@/lib/commerce/CartService';

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

function errorStatus(message: string): number {
  if (message.startsWith('unknown_item:')) return 404;
  if (message === 'subscription_items_not_cart_eligible' || message === 'quantity_must_be_positive') return 400;
  return 500;
}

/** POST /api/cart/items { itemId, quantity? } — add to cart (accumulates quantity). */
export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const itemId = typeof body?.itemId === 'string' ? body.itemId : '';
  const quantity = Number.isFinite(body?.quantity) ? Math.max(1, Math.floor(Number(body.quantity))) : 1;
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

  try {
    const cart = await addItem(userId, itemId, quantity);
    return NextResponse.json({ ok: true, ...cart });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: errorStatus(message) });
  }
}

/** PATCH /api/cart/items { itemId, quantity } — set exact quantity (<=0 removes). */
export async function PATCH(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const itemId = typeof body?.itemId === 'string' ? body.itemId : '';
  const quantity = Number.isFinite(body?.quantity) ? Math.floor(Number(body.quantity)) : NaN;
  if (!itemId || Number.isNaN(quantity)) {
    return NextResponse.json({ error: 'itemId and quantity required' }, { status: 400 });
  }

  try {
    const cart = await setQuantity(userId, itemId, quantity);
    return NextResponse.json({ ok: true, ...cart });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: errorStatus(message) });
  }
}

/** DELETE /api/cart/items { itemId } — remove a line entirely. */
export async function DELETE(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const itemId = typeof body?.itemId === 'string' ? body.itemId : '';
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

  const cart = await removeItem(userId, itemId);
  return NextResponse.json({ ok: true, ...cart });
}
