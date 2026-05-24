export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { voteForBeat, markBeatStatus } from '@/lib/beats/LiveBeatLocker';

export async function POST(req: NextRequest) {
  let body: { beatId?: string; action?: 'vote' | 'reject' | 'promote' } = {};
  try { body = await req.json(); } catch { /* no body */ }

  const { beatId, action = 'vote' } = body;
  if (!beatId) return NextResponse.json({ error: 'beatId required' }, { status: 400 });

  if (action === 'vote') {
    const ok = voteForBeat(beatId);
    return NextResponse.json({ ok });
  }
  if (action === 'reject') {
    const ok = markBeatStatus(beatId, 'rejected');
    return NextResponse.json({ ok });
  }
  if (action === 'promote') {
    const ok = markBeatStatus(beatId, 'marketplace');
    return NextResponse.json({ ok });
  }
  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
