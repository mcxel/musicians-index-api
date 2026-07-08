export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { competitionMusicEngine, MusicConfig, CompetitionType, CypherMode } from '@/lib/competition/CompetitionMusicEngine';
import { getActiveSessions } from '@/lib/broadcast/GlobalLiveSessionRegistry';

interface Room {
  id: string;
  name: string;
  type: 'BATTLE' | 'CYPHER' | 'SHOWCASE' | 'CHALLENGE' | 'GENERAL';
  hostId: string;
  hostName: string;
  capacity: number;
  occupancy: number;
  isLive: boolean;
  genre?: string;
  format?: string;
  musicConfig?: MusicConfig;
  createdAt: string;
}

// In-process POST-created rooms (session-local, not persisted)
const _postedRooms: Room[] = [];

const CATEGORY_TO_TYPE: Record<string, Room['type']> = {
  battle:    'BATTLE',
  cypher:    'CYPHER',
  challenge: 'CHALLENGE',
  concert:   'SHOWCASE',
  live:      'GENERAL',
};

export async function GET(req: NextRequest) {
  const typeFilter = req.nextUrl.searchParams.get('type')?.toUpperCase();
  const liveFilter = req.nextUrl.searchParams.get('live');

  // Real rooms from GlobalLiveSessionRegistry (Rule 20 — no fake data)
  const sessions = getActiveSessions();
  const registryRooms: Room[] = sessions.map((s) => ({
    id:        s.roomId ?? s.userId,
    name:      s.displayName ?? s.title ?? 'Live Room',
    type:      (CATEGORY_TO_TYPE[s.category ?? ''] ?? 'GENERAL') as Room['type'],
    hostId:    s.userId,
    hostName:  s.displayName ?? 'Host',
    capacity:  10000,
    occupancy: s.viewerCount ?? 0,
    isLive:    true,
    genre:     s.category ?? undefined,
    createdAt: typeof s.startedAt === 'number'
      ? new Date(s.startedAt).toISOString()
      : new Date().toISOString(),
  }));

  // Merge POST-created rooms (they start not-yet-live)
  let result: Room[] = [...registryRooms, ..._postedRooms];

  if (typeFilter) result = result.filter(r => r.type === typeFilter);
  if (liveFilter === 'true') result = result.filter(r => r.isLive);

  return NextResponse.json({ rooms: result, total: result.length });
}

const TYPE_TO_COMPETITION: Record<string, CompetitionType> = {
  BATTLE: 'battle',
  CYPHER: 'cypher',
  CHALLENGE: 'challenge',
  SHOWCASE: 'showcase',
  GENERAL: 'battle',
};

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<Room> & { format?: string; cypherMode?: CypherMode; sponsorId?: string; beatIds?: string[]; metadata?: { battleType?: string } };
  if (!body.name || !body.type) return NextResponse.json({ error: 'name and type required' }, { status: 400 });

  const competitionType: CompetitionType = TYPE_TO_COMPETITION[body.type] ?? 'battle';
  const musicConfig = competitionMusicEngine.resolveMusicConfig({
    competitionType,
    format: body.format ?? body.metadata?.battleType,
    genre: body.genre,
    sponsorId: body.sponsorId,
    cypherMode: body.cypherMode,
    beatIds: body.beatIds,
  });

  const room: Room = {
    id: `room-${Date.now()}`,
    name: body.name,
    type: body.type as Room['type'],
    hostId: body.hostId ?? 'anonymous',
    hostName: body.hostName ?? 'Anonymous',
    capacity: body.capacity ?? 100,
    occupancy: 1,
    isLive: false,
    genre: body.genre,
    format: body.format,
    musicConfig,
    createdAt: new Date().toISOString(),
  };
  competitionMusicEngine.bindToRoom(room.id, musicConfig);
  _postedRooms.unshift(room);
  return NextResponse.json({ ok: true, room }, { status: 201 });
}
