export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import prisma from '@/lib/prisma';
import { eventOrchestrator } from '@/lib/competition/EventOrchestrator';
import { canCreateChallenge, canCreateMoreSessions } from '@/lib/subscriptions/BattleCreationGate';
import type { SubscriptionTier } from '@/lib/subscriptions/SubscriptionPricingEngine';

// Challenge creation converges onto the same real EventOrchestrator/LobbyEvent
// pipeline Mini Battles use (see apps/web/src/app/api/battles/mini/route.ts) —
// same canonical creation authority, tagged with the "cultural-challenge"
// format (BattleFormatRulesEngine, category:"contest") instead of a battle
// format. No second room-creation engine. Previously this route returned a
// fabricated challengeId/roomSlug with zero persistence (2026-09-22 room
// lifecycle audit) — that fake-success behavior is removed entirely.

function normalizeTier(raw: string): SubscriptionTier {
  const upper = raw.toUpperCase();
  if (upper === 'RUBY') return 'RUBY';
  return raw.toLowerCase() as SubscriptionTier;
}

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'authentication_required' }, { status: 401 });
  }

  const tier = normalizeTier(auth.user.tier || 'free');
  const creationGate = canCreateChallenge(tier);
  if (!creationGate.allowed) {
    return NextResponse.json({ ok: false, error: 'tier_gate', ...creationGate }, { status: 403 });
  }

  const activeSessions = await prisma.lobbyEvent.count({
    where: { creatorUserId: auth.user.id, isMini: true, status: { not: 'completed' } },
  });
  const sessionGate = canCreateMoreSessions(tier, activeSessions);
  if (!sessionGate.allowed) {
    return NextResponse.json({ ok: false, error: 'session_limit', ...sessionGate }, { status: 403 });
  }

  let body: {
    genreId?: string;
    genreName?: string;
    title?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    // no body is fine — defaults apply below
  }

  const genreId = typeof body.genreId === 'string' ? body.genreId : undefined;
  const genreName = typeof body.genreName === 'string' ? body.genreName : undefined;
  const title = typeof body.title === 'string' && body.title.trim()
    ? body.title.trim()
    : `${auth.user.name}'s Cultural Challenge`;

  const roomId = `mini-challenge-${randomUUID()}`;

  const compiled = await eventOrchestrator.compileEvent(
    roomId,
    'mini-challenge', // no HostShowAssignmentEngine entry by design — Mini events are user-run, not bot-hosted
    'cultural-challenge',
    0,
    { genreId, genreName, title },
    { creatorUserId: auth.user.id, isMini: true },
  );

  if (!compiled) {
    return NextResponse.json({ ok: false, error: 'compile_failed' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    success: true,
    roomId: compiled.roomId,
    title: compiled.title,
    format: compiled.format,
    status: compiled.status,
    // Same LobbyEntryFlow (Rule 15) hop Mini Battles use — the creator still
    // needs a real seat assignment like any other entrant.
    joinUrl: `/live/lobby?room=${encodeURIComponent(compiled.roomId)}`,
  });
}

/**
 * GET /api/challenges/create — real, active Mini Challenges (mirrors
 * GET /api/battles/mini). Same LobbyEvent table, filtered by the
 * cultural-challenge format instead of by isMini alone, so Battle and
 * Challenge listings stay distinct despite sharing one canonical table.
 */
export async function GET() {
  const rows = await prisma.lobbyEvent.findMany({
    where: { isMini: true, format: 'cultural-challenge', status: { not: 'completed' } },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  const challenges = rows.map((r) => ({
    roomId: r.roomId,
    title: r.title,
    format: r.format,
    genreName: r.genreName,
    status: r.status,
    creatorUserId: r.creatorUserId,
    viewerCount: r.viewerCount,
    updatedAt: r.updatedAt,
  }));

  return NextResponse.json({ ok: true, success: true, challenges });
}
