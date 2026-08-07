'use client';

/**
 * Games Lobby Wall — real live sessions only (Rule 20).
 * No hardcoded prize pools / fake viewer counts.
 */

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
    id: resolvedRoomId,
    name: `${entry.displayName} — Game`,
    performerName: entry.displayName,
    type: 'game',
    href: `/live/rooms/${resolvedRoomId}`,
    viewerCount: entry.viewerCount,
    status: 'live',
    genre: entry.genre,
  };
}

export default function GamesLobbyWallPage() {
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/live/go?wall=game', {
          cache: 'no-store',
          credentials: 'include',
        });
        const data = (await res.json()) as { live?: LiveApiEntry[] };
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
        title="Games Lobby Wall"
        accentColor="#FFD700"
        typeLabel="GAMES"
      />
    </>
  );
}
