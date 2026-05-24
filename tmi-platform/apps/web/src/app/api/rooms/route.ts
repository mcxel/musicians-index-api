export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

interface Room {
  id: string;
  name: string;
  type: 'BATTLE' | 'CYPHER' | 'SHOWCASE' | 'GENERAL';
  hostId: string;
  hostName: string;
  capacity: number;
  occupancy: number;
  isLive: boolean;
  genre?: string;
  createdAt: string;
}

const rooms: Room[] = [
  { id: 'room-001', name: 'Monday Cypher', type: 'CYPHER', hostId: 'wavetek', hostName: 'Wavetek_Pro', capacity: 100, occupancy: 34, isLive: true, genre: 'Hip-Hop', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'room-002', name: 'Battle Arena — Open Bracket', type: 'BATTLE', hostId: 'tmi-system', hostName: 'TMI System', capacity: 200, occupancy: 87, isLive: true, genre: 'Freestyle Open', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { id: 'room-003', name: 'R&B Showcase Night', type: 'SHOWCASE', hostId: 'nova-k', hostName: 'Nova_K', capacity: 150, occupancy: 12, isLive: false, genre: 'R&B', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
];

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');
  const live = req.nextUrl.searchParams.get('live');
  let result = [...rooms];
  if (type) result = result.filter(r => r.type === type.toUpperCase());
  if (live === 'true') result = result.filter(r => r.isLive);
  return NextResponse.json({ rooms: result, total: result.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<Room>;
  if (!body.name || !body.type) return NextResponse.json({ error: 'name and type required' }, { status: 400 });
  const room: Room = {
    id: `room-${Date.now()}`,
    name: body.name,
    type: body.type,
    hostId: body.hostId ?? 'anonymous',
    hostName: body.hostName ?? 'Anonymous',
    capacity: body.capacity ?? 100,
    occupancy: 1,
    isLive: false,
    genre: body.genre,
    createdAt: new Date().toISOString(),
  };
  rooms.unshift(room);
  return NextResponse.json({ ok: true, room }, { status: 201 });
}
