import { NextRequest, NextResponse } from 'next/server';
import {
  completeCompetitiveSession,
  createCompetitiveSession,
  expireStaleCompetitiveSessions,
  getCompetitiveLifecycleMetrics,
  getCompetitiveSession,
  handleCompetitiveParticipantLeave,
  listCompetitiveSessions,
  registerContenderJoin,
  runAutoProgressionAfterContender,
  transitionCompetitiveSession,
  type CompetitiveSessionState,
} from '@/lib/live/CompetitiveSessionLifecycleEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const includeMetrics = req.nextUrl.searchParams.get('metrics') === '1';
  if (includeMetrics) {
    return NextResponse.json({ metrics: getCompetitiveLifecycleMetrics() });
  }

  const roomId = req.nextUrl.searchParams.get('roomId');
  if (roomId) {
    return NextResponse.json({ session: getCompetitiveSession(roomId) });
  }
  return NextResponse.json({ sessions: listCompetitiveSessions() });
}

export async function POST(req: NextRequest) {
  let body: { roomId?: string; mode?: 'battle' | 'cypher' | 'challenge'; hostUserId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.roomId || !body.mode || !body.hostUserId) {
    return NextResponse.json({ error: 'roomId, mode, and hostUserId are required' }, { status: 400 });
  }

  return NextResponse.json({ session: createCompetitiveSession({ roomId: body.roomId, mode: body.mode, hostUserId: body.hostUserId }) });
}

export async function PATCH(req: NextRequest) {
  let body: {
    roomId?: string;
    action?: 'transition' | 'contender_join' | 'auto_progress' | 'complete' | 'participant_leave' | 'expire_stale';
    state?: CompetitiveSessionState;
    contenderUserId?: string;
    userId?: string;
    waitingTimeoutMs?: number;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.action) {
    return NextResponse.json({ error: 'action is required' }, { status: 400 });
  }

  if (body.action === 'expire_stale') {
    const expired = expireStaleCompetitiveSessions({ waitingTimeoutMs: body.waitingTimeoutMs });
    return NextResponse.json({ ok: true, expiredCount: expired.length });
  }

  if (!body.roomId) {
    return NextResponse.json({ error: 'roomId and action are required' }, { status: 400 });
  }

  let session = null;
  if (body.action === 'transition') {
    if (!body.state) {
      return NextResponse.json({ error: 'state is required for transition action' }, { status: 400 });
    }
    session = transitionCompetitiveSession(body.roomId, body.state);
  }

  if (body.action === 'contender_join') {
    if (!body.contenderUserId) {
      return NextResponse.json({ error: 'contenderUserId is required for contender_join action' }, { status: 400 });
    }
    session = registerContenderJoin(body.roomId, body.contenderUserId);
  }

  if (body.action === 'auto_progress') {
    session = runAutoProgressionAfterContender(body.roomId);
  }

  if (body.action === 'complete') {
    session = completeCompetitiveSession(body.roomId);
  }

  if (body.action === 'participant_leave') {
    if (!body.userId) {
      return NextResponse.json({ error: 'userId is required for participant_leave action' }, { status: 400 });
    }
    session = handleCompetitiveParticipantLeave(body.roomId, body.userId);
  }

  if (!session) {
    return NextResponse.json({ error: 'session not found' }, { status: 404 });
  }

  return NextResponse.json({ session });
}
