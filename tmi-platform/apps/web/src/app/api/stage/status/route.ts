/**
 * Stage Status API
 * GET /api/stage/status?roomId=monday-stage
 * Returns current stage state for a given room.
 * Proxies to NestJS; falls back to stub.
 */
import { proxyToApi } from '@/lib/apiProxy';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId') ?? 'default';

  try {
    const res = await proxyToApi(req as unknown as Request, `/stage/${roomId}/status`);
    if (res.status === 200) return res;
  } catch {
    // fall through
  }

  return NextResponse.json({
    roomId,
    state: 'CURTAIN_CLOSED',
    showTitle: null,
    artistName: null,
    updatedAt: new Date().toISOString(),
  });
}
