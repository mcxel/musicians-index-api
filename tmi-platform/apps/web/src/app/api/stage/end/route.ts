/**
 * Stage End API
 * POST /api/stage/end
 * Body: { roomId: string }
 * Triggers CURTAIN_CLOSING → ENDED sequence.
 */
import { proxyToApi } from '@/lib/apiProxy';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body: { roomId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { roomId = 'default' } = body;

  try {
    const res = await proxyToApi(req as unknown as Request, `/stage/${roomId}/end`);
    if (res.status === 200 || res.status === 201) return res;
  } catch {
    // fall through
  }

  return NextResponse.json({
    roomId,
    state: 'CURTAIN_CLOSING',
    updatedAt: new Date().toISOString(),
  });
}
