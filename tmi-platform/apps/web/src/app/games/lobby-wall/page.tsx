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
  avatarUrl?: string;
  isBot?: boolean;
  isJoinable?: boolean;
  status?: 'live' | 'starting';
  competitiveLifecycleState?: 'preparing' | 'waiting_for_contender' | 'opponent_joined' | 'vs_animation' | 'countdown' | 'live' | 'winner_results' | 'replay' | 'archive' | null;
  privacy?: 'PUBLIC' | 'PAID_ENTRY' | 'INVITE_ONLY';
};

function toRoom(entry: LiveApiEntry): LobbyRoom {
  const resolvedRoomId = entry.roomId ?? `room-${entry.userId}`;
  return {
    id: entry.userId,
    name: `${entry.displayName} — Game`,
    performerName: entry.displayName,
    type: 'game',
    href: `/live/rooms/${resolvedRoomId}`,
    viewerCount: entry.viewerCount,
    status: entry.status === 'starting' ? 'starting' : 'live',
    avatarUrl: entry.avatarUrl,
    isBot: entry.isBot === true,
    isJoinable: entry.isJoinable !== false,
    visibility: entry.privacy === 'PUBLIC' ? 'public' : 'private',
    competitiveLifecycleState: entry.competitiveLifecycleState ?? null,
    genre: entry.genre,
  };
}

export default function GamesLobbyWallPage() {
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);

  useEffect(() => {
    let cancelled = false;
    let pollMs = 5000;
    const load = async () => {
      try {
        const res = await fetch('/api/live/go?wall=game&includeBots=1', { cache: 'no-store', credentials: 'include' });
        const data = await res.json() as { live?: LiveApiEntry[]; config?: { rotationIntervalSeconds?: number } };
        if (!cancelled) setRooms((data.live ?? []).map(toRoom));
        const seconds = data.config?.rotationIntervalSeconds;
        if (typeof seconds === 'number' && Number.isFinite(seconds)) {
          pollMs = Math.max(5000, Math.round(seconds * 1000));
        }
      } catch {
        if (!cancelled) setRooms([]);
      } finally {
        if (!cancelled) {
          setTimeout(load, pollMs);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <GlobalTopNavRail />
      <LiveLobbyWallGrid
        rooms={rooms}
        title="Games of the Week"
        accentColor="#FFD700"
        typeLabel="GAMES"
      />
    </>
  );
}
