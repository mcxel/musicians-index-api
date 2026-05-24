export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const INCIDENTS = [
  { id: 'inc-001', severity: 'LOW', title: 'Payout queue depth elevated', subsystem: 'payouts', status: 'OPEN', description: '$1,750 in payouts awaiting Big Ace approval for >24h', createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), resolvedAt: null },
  { id: 'inc-002', severity: 'INFO', title: 'Bot RecoveryBot-01 restarted', subsystem: 'bots', status: 'RESOLVED', description: 'Session recovery bot was restarted after no activity for 2 hours. Now healthy.', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), resolvedAt: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString() },
];

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20');
  return NextResponse.json({ incidents: INCIDENTS.slice(0, limit), open: INCIDENTS.filter(i => i.status === 'OPEN').length });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { title?: string; severity?: string; subsystem?: string; description?: string };
  if (!body.title) return NextResponse.json({ error: 'title required' }, { status: 400 });
  const incident = { id: `inc-${Date.now()}`, severity: body.severity ?? 'INFO', title: body.title, subsystem: body.subsystem ?? 'platform', status: 'OPEN', description: body.description ?? '', createdAt: new Date().toISOString(), resolvedAt: null };
  INCIDENTS.unshift(incident);
  return NextResponse.json({ ok: true, incident }, { status: 201 });
}
