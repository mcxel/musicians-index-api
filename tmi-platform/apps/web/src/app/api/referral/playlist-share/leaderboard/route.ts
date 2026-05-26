export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import { getPlaylistShareLeaderboard } from '@/lib/share/ShareTrackingEngine';

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

function parseLimit(raw: string | null): number {
  const n = Number(raw ?? '20');
  if (!Number.isFinite(n)) return 20;
  return Math.max(1, Math.min(100, Math.floor(n)));
}

function isAdminAuthorized(req: NextRequest): boolean {
  const requiredKey = process.env.INTERNAL_ADMIN_API_KEY?.trim();
  if (!requiredKey) return true;
  const key = req.headers.get('x-tmi-admin-key')?.trim();
  return !!key && key === requiredKey;
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`playlist-share-leaderboard:${ip}`, 60, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const limit = parseLimit(req.nextUrl.searchParams.get('limit'));
  const leaderboard = getPlaylistShareLeaderboard(limit);
  return NextResponse.json({ ok: true, leaderboard });
}
