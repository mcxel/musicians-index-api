'use client';
import { useEffect, useState } from 'react';
import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallGrid, { type LobbyRoom } from '@/components/live/LiveLobbyWallGrid';
import GauntletBattleWallCard from '@/components/gauntlet/GauntletBattleWallCard';
import { isGauntletDiscoveryEnabled, ensureCanonicalGauntletRoom } from '@/lib/gauntlet/GauntletRoomRuntime';

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
    href: `/rooms/battle/${resolvedRoomId}`,
    viewerCount: entry.viewerCount,
    status: 'live',
    genre: entry.genre,
  };
}

export default function BattlesLobbyWallPage() {
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const showGauntlet = isGauntletDiscoveryEnabled();

  useEffect(() => {
    if (showGauntlet) ensureCanonicalGauntletRoom();
  }, [showGauntlet]);

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
      {showGauntlet && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 20px 0', background: '#050510' }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', color: '#FFD700', marginBottom: 10 }}>
            BATTLE SUBTYPE · MUSICAL GAUNTLET
          </div>
          <div style={{ maxWidth: 280 }}>
            <GauntletBattleWallCard />
          </div>
        </div>
      )}
      <LiveLobbyWallGrid
        rooms={rooms}
        title="Battle Billboard Wall"
        accentColor="#FF2DAA"
        typeLabel="BATTLES"
      />
    </>
  );
}
