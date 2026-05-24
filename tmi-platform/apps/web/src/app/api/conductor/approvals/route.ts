export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const SEED_APPROVALS = [
  { id: 'apv-001', type: 'PAYOUT', description: 'Payout $250 to Wavetek_Pro (Monthly Idol Q1)', amount: 250, requestedBy: 'system', status: 'PENDING', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'apv-002', type: 'PAYOUT', description: 'Payout $1,000 to LyricStone (Contest Win)', amount: 1000, requestedBy: 'system', status: 'PENDING', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 'apv-003', type: 'ACCOUNT', description: 'Sponsor account upgrade request — BrandX Corp', amount: 0, requestedBy: 'brand-x-corp', status: 'PENDING', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'apv-004', type: 'PAYOUT', description: 'Payout $500 to Krypt (Beat Sales Q1)', amount: 500, requestedBy: 'system', status: 'APPROVED', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
];

const approvals = [...SEED_APPROVALS];

export async function GET() {
  return NextResponse.json({ approvals, pending: approvals.filter(a => a.status === 'PENDING').length });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { id?: string; action?: string };
  const { id, action } = body;
  const idx = approvals.findIndex(a => a.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (action === 'approve') approvals[idx]!.status = 'APPROVED';
  else if (action === 'deny') approvals[idx]!.status = 'DENIED';
  else return NextResponse.json({ error: 'action must be approve or deny' }, { status: 400 });
  return NextResponse.json({ ok: true, approval: approvals[idx] });
}
