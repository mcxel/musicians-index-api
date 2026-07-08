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
    name: `${entry.displayName} — Challenge`,
    performerName: entry.displayName,
    type: 'challenge',
    href: `/live/rooms/${resolvedRoomId}`,
    viewerCount: entry.viewerCount,
    status: 'live',
    genre: entry.genre,
  };
}

export default function ChallengesLobbyWallPage() {
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/live/go?wall=challenge', { cache: 'no-store', credentials: 'include' });
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
        title="Challenge Lobby Wall"
        accentColor="#00FFFF"
        typeLabel="CHALLENGES"
      />
    </>
  );
}
