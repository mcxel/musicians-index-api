export const dynamic = 'force-dynamic';
/**
 * POST /api/rooms — converge onto GlobalLiveSessionRegistry via the same
 * entitlement gate as POST /api/live/go (Targets 2–3).
 * Legacy in-memory mock rooms list kept for GET only (honest: not active SoT).
 */

import { NextRequest, NextResponse } from 'next/server';
import { competitionMusicEngine, MusicConfig, CompetitionType, CypherMode } from '@/lib/competition/CompetitionMusicEngine';
import { assertCreateRoomEntitlement } from '@/lib/subscriptions/assertCreateRoomEntitlement';
import { registerLiveSession, getSession, getSessionsByCategory, endLiveSession } from '@/lib/broadcast/globalLiveSessionStore';
import { ensureHydrated, persistSessionNow } from '@/lib/broadcast/GlobalLiveSessionRegistry.server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import {
  datingAccessPayload,
  DATING_EXPERIENCE_MANIFEST,
  datingExperienceMayLaunch,
  isDatingExperience,
  type DatingExperienceRef,
} from '@/lib/trustSafety/DatingExperiencePolicy';
import {
  evaluateDatingJoinForUserId,
  filterDatingExperiencesForUserId,
} from '@/lib/trustSafety/datingExperienceGuard';

interface Room {
  id: string;
  name: string;
  type: 'BATTLE' | 'CYPHER' | 'SHOWCASE' | 'CHALLENGE' | 'GENERAL' | 'DATING' | 'LOUNGE' | 'DANCE' | 'CONCERT' | 'RELEASE' | 'PREMIERE';
  hostId: string;
  hostName: string;
  capacity: number;
  occupancy: number;
  isLive: boolean;
  genre?: string;
  format?: string;
  musicConfig?: MusicConfig;
  createdAt: string;
  experienceClass?: 'DATING';
  minimumAge?: number;
  ageVerificationRequired?: boolean;
}

/** Legacy GET inventory — NOT the active-room truth counter (use GET /api/live/go). */
const rooms: Room[] = [];

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');
  const live = req.nextUrl.searchParams.get('live');
  let result = [...rooms];
  if (type) result = result.filter(r => r.type === type.toUpperCase());
  if (live === 'true') result = result.filter(r => r.isLive);
  const auth = await getTmiAuth();
  result = await filterDatingExperiencesForUserId(auth?.user?.id, result, (r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    experienceClass: r.experienceClass,
    minimumAge: r.minimumAge,
    ageVerificationRequired: r.ageVerificationRequired,
  }));
  return NextResponse.json({
    rooms: result,
    total: result.length,
    notice: 'Active live rooms: GET /api/live/go — this list is not the LIVE NOW SoT.',
  });
}

const TYPE_TO_COMPETITION: Record<string, CompetitionType> = {
  BATTLE: 'battle',
  CYPHER: 'cypher',
  CHALLENGE: 'challenge',
  SHOWCASE: 'showcase',
  GENERAL: 'battle',
  LOUNGE: 'battle',
  DANCE: 'battle',
  CONCERT: 'battle',
  RELEASE: 'battle',
  PREMIERE: 'battle',
};

const TYPE_TO_CATEGORY: Record<string, string> = {
  BATTLE: 'battle',
  CYPHER: 'cypher',
  CHALLENGE: 'challenge',
  LOUNGE: 'lounge',
  DANCE: 'dance',
  CONCERT: 'concert',
  RELEASE: 'release',
  PREMIERE: 'release',
  SHOWCASE: 'showcase',
  GENERAL: 'live',
};

export async function POST(req: NextRequest) {
  let body: Partial<Room> & {
    format?: string;
    cypherMode?: CypherMode;
    sponsorId?: string;
    beatIds?: string[];
    metadata?: { battleType?: string; scope?: string; isGame?: boolean };
    experienceClass?: string;
    minimumAge?: number;
    ageVerificationRequired?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.name || !body.type) {
    return NextResponse.json({ error: 'name and type required' }, { status: 400 });
  }

  const category = TYPE_TO_CATEGORY[body.type.toUpperCase()] ?? 'live';
  const gate = await assertCreateRoomEntitlement(req, category);
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, code: gate.code, tier: gate.tier },
      { status: gate.status },
    );
  }

  const datingRef: DatingExperienceRef = {
    name: body.name,
    type: body.type,
    experienceClass: body.experienceClass,
    minimumAge: body.minimumAge,
    ageVerificationRequired: body.ageVerificationRequired,
    tags: body.type ? [body.type] : undefined,
  };
  const dating = isDatingExperience(datingRef);

  if (dating) {
    const launch = datingExperienceMayLaunch(datingRef);
    if (!launch.allowed) {
      return NextResponse.json(datingAccessPayload(launch), { status: 403 });
    }
    const access = await evaluateDatingJoinForUserId(gate.userId, {
      ...DATING_EXPERIENCE_MANIFEST,
      name: body.name,
      type: body.type,
    });
    if (!access.allowed) {
      return NextResponse.json(datingAccessPayload(access), { status: 403 });
    }
  }

  const competitionType: CompetitionType = TYPE_TO_COMPETITION[body.type] ?? 'battle';
  const musicConfig = dating
    ? undefined
    : competitionMusicEngine.resolveMusicConfig({
        competitionType,
        format: body.format ?? body.metadata?.battleType,
        genre: body.genre,
        sponsorId: body.sponsorId,
        cypherMode: body.cypherMode,
        beatIds: body.beatIds,
      });

  const roomId = `room-${gate.userId}-${Date.now()}`;

  await ensureHydrated();
  const session = registerLiveSession({
    userId: gate.userId,
    displayName: gate.displayName,
    title: body.name,
    category: category as any,
    roomId,
    privacy: 'PUBLIC',
  });

  const verified = getSession(gate.userId);
  const discoverable = getSessionsByCategory(session.category).some((s) => s.userId === gate.userId);
  if (!verified || !discoverable) {
    endLiveSession(gate.userId);
    return NextResponse.json(
      { ok: false, error: 'Room registered but not discoverable.', code: 'RUNTIME_FAIL' },
      { status: 409 },
    );
  }

  try {
    await persistSessionNow(session);
  } catch (err) {
    endLiveSession(gate.userId);
    console.error('[api/rooms] persist failed', err);
    return NextResponse.json(
      { ok: false, error: 'Could not persist room session.', code: 'PERSIST_FAIL' },
      { status: 503 },
    );
  }

  if (musicConfig) {
    competitionMusicEngine.bindToRoom(roomId, musicConfig);
  }

  const room: Room = {
    id: roomId,
    name: body.name,
    type: body.type as Room['type'],
    hostId: gate.userId,
    hostName: gate.displayName,
    capacity: body.capacity ?? 100,
    occupancy: 1,
    isLive: true,
    genre: body.genre,
    format: body.format,
    musicConfig,
    createdAt: new Date().toISOString(),
    experienceClass: dating ? DATING_EXPERIENCE_MANIFEST.experienceClass : undefined,
    minimumAge: dating ? DATING_EXPERIENCE_MANIFEST.minimumAge : undefined,
    ageVerificationRequired: dating ? DATING_EXPERIENCE_MANIFEST.ageVerificationRequired : undefined,
  };
  rooms.unshift(room);

  let exactHref = `/live/rooms/${encodeURIComponent(roomId)}?from=live-lobby`;
  const upperType = body.type.toUpperCase();
  if (upperType === 'BATTLE') {
    exactHref = body.format === 'gauntlet'
      ? `/rooms/battle/gauntlet/${encodeURIComponent(roomId)}`
      : `/rooms/battle/${encodeURIComponent(roomId)}`;
  } else if (upperType === 'CHALLENGE') {
    exactHref = `/rooms/challenge/${encodeURIComponent(roomId)}`;
  } else if (upperType === 'CYPHER') {
    exactHref = `/rooms/cypher/${encodeURIComponent(roomId)}`;
  } else if (upperType === 'LOUNGE') {
    exactHref = `/rooms/playlist-lounge?roomId=${encodeURIComponent(roomId)}`;
  } else if (upperType === 'DANCE') {
    exactHref = `/rooms/world-dance-party?roomId=${encodeURIComponent(roomId)}`;
  } else if (upperType === 'CONCERT') {
    const scope = body.metadata?.scope === 'world' ? 'world' : 'mini';
    exactHref = `/rooms/concert/${encodeURIComponent(roomId)}?scope=${scope}`;
  } else if (upperType === 'RELEASE') {
    const scope = body.metadata?.scope === 'world' ? 'world' : 'mini';
    exactHref = `/rooms/release/${encodeURIComponent(roomId)}?scope=${scope}`;
  } else if (upperType === 'PREMIERE') {
    const isWorld = body.metadata?.scope === 'world';
    exactHref = isWorld
      ? `/rooms/world-premiere?roomId=${encodeURIComponent(roomId)}`
      : `/rooms/release/${encodeURIComponent(roomId)}?scope=mini&kind=MINI_PREMIERE`;
  } else if (upperType === 'GENERAL' && body.metadata?.isGame) {
    exactHref = `/rooms/game?roomId=${encodeURIComponent(roomId)}`;
  }

  return NextResponse.json({
    ok: true,
    room,
    session,
    roomId,
    href: exactHref,
  }, { status: 201 });
}
