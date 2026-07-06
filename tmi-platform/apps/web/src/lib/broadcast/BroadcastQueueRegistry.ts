// BroadcastQueueRegistry — Pass 1 Broadcast Foundation data layer.
// Normalizes real live-room API data into canonical broadcast states.
// Rule 20: every item here traces to /api/live/rooms — no fabricated entries.

export type BroadcastRoomType = 'event' | 'venue' | 'cypher' | 'battle' | 'contest';

export type BroadcastState =
  | 'WAITING'
  | 'STARTING'
  | 'LIVE'
  | 'BATTLE'
  | 'CYPHER'
  | 'REPLAY'
  | 'ARCHIVED';

export type LiveRoomStatus = 'scheduled' | 'open' | 'live' | 'paused' | 'closed' | 'archived';

export interface LiveRoomRecord {
  roomId: string;
  roomType: BroadcastRoomType;
  title: string;
  status: LiveRoomStatus;
  genre?: string;
}

export interface BroadcastQueueItem {
  id: string;
  title: string;
  roomType: BroadcastRoomType;
  state: BroadcastState;
  genre?: string;
  href: string;
  accent: string;
}

export const BROADCAST_ACCENT_BY_TYPE: Record<BroadcastRoomType, string> = {
  event: '#00FFFF',
  venue: '#7a5cff',
  cypher: '#AA2DFF',
  battle: '#FF2DAA',
  contest: '#FFD700',
};

export const BROADCAST_TYPE_LABEL: Record<BroadcastRoomType, string> = {
  event: 'Live Performances',
  venue: 'World Concerts',
  cypher: 'Cyphers',
  battle: 'Battles',
  contest: 'Challenges',
};

export function isOnAir(state: BroadcastState): boolean {
  return state === 'LIVE' || state === 'BATTLE' || state === 'CYPHER';
}

export function stateForRoom(room: Pick<LiveRoomRecord, 'status' | 'roomType'>): BroadcastState {
  switch (room.status) {
    case 'live':
      if (room.roomType === 'battle') return 'BATTLE';
      if (room.roomType === 'cypher') return 'CYPHER';
      return 'LIVE';
    case 'scheduled':
      return 'STARTING';
    case 'open':
    case 'paused':
      return 'WAITING';
    case 'closed':
    case 'archived':
      return 'ARCHIVED';
  }
}

export function normalizeLiveRoom(room: LiveRoomRecord): BroadcastQueueItem {
  return {
    id: room.roomId,
    title: room.title,
    roomType: room.roomType,
    state: stateForRoom(room),
    ...(room.genre ? { genre: room.genre } : {}),
    href: `/live/rooms/${encodeURIComponent(room.roomId)}`,
    accent: BROADCAST_ACCENT_BY_TYPE[room.roomType],
  };
}

export function sortBroadcastQueue(items: BroadcastQueueItem[]): BroadcastQueueItem[] {
  return [...items].sort((a, b) => Number(isOnAir(b.state)) - Number(isOnAir(a.state)));
}

/** Fetch the real active-room queue. ARCHIVED rooms are dropped — nothing to broadcast. */
export async function fetchBroadcastQueue(): Promise<BroadcastQueueItem[]> {
  const response = await fetch('/api/live/rooms?active=true', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`live_rooms_fetch_failed_${response.status}`);
  }
  const payload = (await response.json()) as { ok: boolean; rooms: LiveRoomRecord[] };
  const rooms = Array.isArray(payload.rooms) ? payload.rooms : [];
  return sortBroadcastQueue(
    rooms.map(normalizeLiveRoom).filter((item) => item.state !== 'ARCHIVED')
  );
}
