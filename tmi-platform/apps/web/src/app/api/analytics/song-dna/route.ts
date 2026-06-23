import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  isSongDnaBestPart,
  isSongDnaNeedsWork,
  songAudienceIntelEngine,
} from '@/lib/analytics/SongAudienceIntelEngine';
import { participationEconomyEngine } from '@/lib/economy/ParticipationEconomyEngine';

export const dynamic = 'force-dynamic';

async function resolveAuthedUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null);
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const songId = req.nextUrl.searchParams.get('songId')?.trim();
  if (!songId) {
    return NextResponse.json({ ok: false, error: 'songId query parameter is required' }, { status: 400 });
  }

  const artistId = req.nextUrl.searchParams.get('artistId')?.trim() ?? undefined;
  const includeRecent = req.nextUrl.searchParams.get('includeRecent') === '1';
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 25);

  const summary = songAudienceIntelEngine.getSummary(songId, artistId);
  const recent = includeRecent ? songAudienceIntelEngine.listRecent(songId, Number.isFinite(limit) ? limit : 25) : undefined;

  return NextResponse.json({ ok: true, summary, recent });
}

export async function POST(req: NextRequest) {
  const userId = await resolveAuthedUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  let body: {
    songId?: string;
    artistId?: string;
    bestPart?: string;
    needsWork?: string;
    listenAgainTomorrow?: boolean;
    comment?: string;
  };

  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const songId = body.songId?.trim();
  const artistId = body.artistId?.trim();
  const bestPart = body.bestPart?.trim().toLowerCase();
  const needsWork = body.needsWork?.trim().toLowerCase();

  if (!songId || !artistId) {
    return NextResponse.json({ ok: false, error: 'songId and artistId are required' }, { status: 400 });
  }

  if (!bestPart || !isSongDnaBestPart(bestPart)) {
    return NextResponse.json({ ok: false, error: 'bestPart is invalid' }, { status: 400 });
  }

  if (!needsWork || !isSongDnaNeedsWork(needsWork)) {
    return NextResponse.json({ ok: false, error: 'needsWork is invalid' }, { status: 400 });
  }

  if (typeof body.listenAgainTomorrow !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'listenAgainTomorrow must be boolean' }, { status: 400 });
  }

  const entry = songAudienceIntelEngine.submit({
    songId,
    artistId,
    userId,
    bestPart,
    needsWork,
    listenAgainTomorrow: body.listenAgainTomorrow,
    comment: body.comment,
  });

  participationEconomyEngine.earn(userId, 'fan', 'participate_poll', {
    songId,
    artistId,
    listenAgainTomorrow: body.listenAgainTomorrow,
  });

  const summary = songAudienceIntelEngine.getSummary(songId, artistId);
  return NextResponse.json({ ok: true, entry, summary });
}
