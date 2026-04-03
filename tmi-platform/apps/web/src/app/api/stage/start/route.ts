/**
 * Stage Start API
 * POST /api/stage/start
 * Body: { roomId: string, showTitle?: string, artistName?: string }
 * Triggers CURTAIN_OPENING → LIVE sequence.
 */
import { proxyToApi } from '@/lib/apiProxy';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body: { roomId?: string; showTitle?: string; artistName?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { roomId = 'default', showTitle, artistName } = body;
  if (!roomId) {
    return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
  }

  try {
    const res = await proxyToApi(req as unknown as Request, `/stage/${roomId}/start`);
    if (res.status === 200 || res.status === 201) return res;
  } catch {
    // fall through
  }

  // Stub: acknowledge the open command
  return NextResponse.json({
    roomId,
    state: 'CURTAIN_OPENING',
    showTitle: showTitle ?? null,
    artistName: artistName ?? null,
    updatedAt: new Date().toISOString(),
  });
}
