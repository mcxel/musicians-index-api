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

function toRoom(entry: LiveApiEntry): LobbyRoom {
  const resolvedRoomId = entry.roomId ?? `room-${entry.userId}`;
  return {
    id: entry.userId,
    name: `${entry.displayName} — Battle`,
    performerName: entry.displayName,
    type: 'battle',
    href: `/live/rooms/${resolvedRoomId}`,
    viewerCount: entry.viewerCount,
    status: 'live',
    genre: entry.genre,
  };
}

export default function BattlesLobbyWallPage() {
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/live/go?wall=battle', { cache: 'no-store', credentials: 'include' });
        const data = await res.json() as { live?: LiveApiEntry[] };
        if (!cancelled) setRooms((data.live ?? []).map(toRoom));
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
        title="Battle Billboard Wall"
        accentColor="#FF2DAA"
        typeLabel="BATTLES"
      />
    </>
  );
}
