export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const PROMOS = [
  { id: 'promo-001', code: 'LAUNCH50', discount: 50, type: 'PERCENT', usesRemaining: 100, expiresAt: '2026-12-31', active: true, description: 'Launch week 50% off' },
  { id: 'promo-002', code: 'ARTIST20', discount: 20, type: 'PERCENT', usesRemaining: 50, expiresAt: '2026-09-30', active: true, description: 'Artist pass 20% discount' },
  { id: 'promo-003', code: 'FANFREE', discount: 0, type: 'FREE_MONTH', usesRemaining: 25, expiresAt: '2026-07-01', active: true, description: 'One free month for fans' },
  { id: 'promo-004', code: 'VIP100', discount: 100, type: 'FLAT_USD', usesRemaining: 10, expiresAt: '2026-06-30', active: false, description: '$100 off VIP pass' },
];

export async function GET() {
  return NextResponse.json({ promos: PROMOS, active: PROMOS.filter(p => p.active).length });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { code?: string; discount?: number; type?: string; expiresAt?: string; description?: string; usesRemaining?: number };
  if (!body.code) return NextResponse.json({ error: 'code required' }, { status: 400 });
  const promo = {
    id: `promo-${Date.now()}`,
    code: body.code.toUpperCase(),
    discount: body.discount ?? 0,
    type: body.type ?? 'PERCENT',
    usesRemaining: body.usesRemaining ?? 100,
    expiresAt: body.expiresAt ?? '2026-12-31',
    active: true,
    description: body.description ?? '',
  };
  PROMOS.unshift(promo);
  return NextResponse.json({ ok: true, promo }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json() as { id?: string; active?: boolean };
  const promo = PROMOS.find(p => p.id === body.id);
  if (!promo) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (typeof body.active === 'boolean') promo.active = body.active;
  return NextResponse.json({ ok: true, promo });
}
