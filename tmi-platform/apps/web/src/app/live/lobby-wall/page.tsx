'use client';
import { useEffect, useState } from 'react';
import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallGrid, { type LobbyRoom } from '@/components/live/LiveLobbyWallGrid';

type LiveApiEntry = {
  userId: string;
  displayName: string;
  genre: string;
  viewerCount: number;
  roomId?: string;
};

const TYPE_SET = new Set(['battle', 'cypher', 'challenge', 'live']);

function toRoom(entry: LiveApiEntry): LobbyRoom {
  const normalizedType = (entry.genre ?? 'live').toLowerCase();
  const roomType: LobbyRoom['type'] = TYPE_SET.has(normalizedType)
    ? (normalizedType as LobbyRoom['type'])
    : 'live';
  const resolvedRoomId = entry.roomId ?? `room-${entry.userId}`;
  return {
    id: entry.userId,
    name: `${entry.displayName} — Live`,
    performerName: entry.displayName,
    type: roomType,
    href: `/live/rooms/${resolvedRoomId}`,
    viewerCount: entry.viewerCount,
    status: 'live',
    genre: entry.genre,
  };
}

export default function AllLiveLobbyWallPage() {
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/live/go?wall=all', { cache: 'no-store', credentials: 'include' });
        const data = await res.json() as { live?: LiveApiEntry[] };
        if (!cancelled) {
          setRooms((data.live ?? []).map(toRoom));
        }
      } catch {
        if (!cancelled) setRooms([]);
      }
    };
    void load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <>
      <GlobalTopNavRail />
      <LiveLobbyWallGrid
        rooms={rooms}
        title="All Live Stations"
        accentColor="#00FF88"
        typeLabel="ALL LIVE"
      />
    </>
  );
}
