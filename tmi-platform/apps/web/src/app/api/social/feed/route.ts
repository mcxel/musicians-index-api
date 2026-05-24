export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getPublicActivityFeed } from '@/lib/social/FanActivityFeedEngine';

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '40', 10);

  const entries = getPublicActivityFeed(Math.min(limit, 100));
  return NextResponse.json({ entries, userId: sessionId ?? null });
}
