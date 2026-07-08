export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getFeed, getFeedRegistrySummary, listFeeds, upsertFeed } from '@/lib/broadcast/FeedRegistry';

export function GET(req: NextRequest) {
  const feedId = req.nextUrl.searchParams.get('feedId');
  if (feedId) {
    return NextResponse.json({ feed: getFeed(feedId as any) });
  }
  return NextResponse.json({
    summary: getFeedRegistrySummary(),
    feeds: listFeeds(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = upsertFeed({
      id: body.id,
      label: body.label,
      type: body.type,
      sourceId: body.sourceId,
      status: body.status ?? 'ready',
      lastUpdatedMs: Date.now(),
      metadata: body.metadata,
    });
    return NextResponse.json({ ok: true, feed: updated, summary: getFeedRegistrySummary() });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
}