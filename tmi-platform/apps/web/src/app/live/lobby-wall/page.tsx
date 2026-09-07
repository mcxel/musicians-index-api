'use client';

/**
 * /live/lobby-wall — All Live Stations wall (CANONICAL).
 * LiveLobbyWallHost + DiscoveryBus (canonical registry feed, Rule 20).
 * Broad category tabs only (no sub-genre chips): Lives | Battles | Cyphers |
 * Challenges | Lounges | Performer Lobbies | Fan Avatar Lobbies.
 * Fan/Band avatar lobby search via RoleGate (Rule 26).
 * ?room= / ?mode=random deep-links open LobbyEntryFlow (moved from /live/lobby).
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallHost from '@/components/live/LiveLobbyWallHost';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';
import { useGlobalLiveSessions } from '@/hooks/useGlobalLiveSessions';

function RoomDeepLinkEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRoomId = searchParams?.get('room') ?? null;
  const modeRandom = searchParams?.get('mode') === 'random';
  const liveSessions = useGlobalLiveSessions();
  const [room, setRoom] = useState<UniversalRoom | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');

  useEffect(() => {
    if (!requestedRoomId && !modeRandom) {
      setStatus('idle');
      setRoom(null);
      return;
    }
    setStatus('loading');
    let match = null;
    if (requestedRoomId) {
      match = liveSessions.find((s) => s.roomId === requestedRoomId) ?? null;
    } else if (modeRandom && liveSessions.length > 0) {
      match = liveSessions[Math.floor(Math.random() * liveSessions.length)] ?? null;
    }
    if (match) {
      setRoom({
        id: match.roomId,
        title: match.title,
        hostName: match.displayName,
        genre: match.category,
        viewers: match.viewerCount,
        status: 'live',
        access: 'free',
        accentColor: match.accentColor || '#00FFFF',
        roomRoute: `/live/rooms/${match.roomId}`,
        venueIndex: 0,
      });
      setStatus('found');
    } else {
      setRoom(null);
      setStatus('not-found');
    }
  }, [requestedRoomId, modeRandom, liveSessions]);

  if (status === 'found' && room) {
    return (
      <LobbyEntryFlow
        room={room}
        onClose={() => router.replace('/live/lobby-wall')}
      />
    );
  }

  if (status === 'loading') {
    return (
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: '0.1em', padding: 24 }}>
        FINDING YOUR ROOM…
      </p>
    );
  }

  return (
    <>
      {status === 'not-found' ? (
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: '12px 24px' }}>
          That room isn't live anymore — here&apos;s what&apos;s live right now.
        </p>
      ) : null}
      <LiveLobbyWallHost
        title="All Live Stations"
        accentColor="#00FF88"
        typeLabel="ALL LIVE"
        variant="page"
        defaultCategory="lives"
        enableMobileRoam
      />
    </>
  );
}

export default function AllLiveLobbyWallPage() {
  return (
    <>
      <GlobalTopNavRail />
      <Suspense fallback={<main className="min-h-screen bg-[#050510]" />}>
        <RoomDeepLinkEntry />
      </Suspense>
    </>
  );
}
