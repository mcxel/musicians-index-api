'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BillboardLiveWall from '@/components/media/BillboardLiveWall';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';

interface LiveApiSession {
  userId: string;
  displayName: string;
  roomId: string;
  category: string;
  viewerCount: number;
  avatarUrl: string | null;
  accentColor: string;
}

function sessionToRoom(session: LiveApiSession): UniversalRoom {
  return {
    id: session.roomId,
    title: `${session.displayName} — Live`,
    hostName: session.displayName,
    genre: session.category,
    viewers: session.viewerCount,
    status: 'live',
    access: 'free',
    accentColor: session.accentColor || '#00FFFF',
    roomRoute: `/live/rooms/${session.roomId}`,
    venueIndex: 0,
  };
}

// Fans deep-linking (or redirected by the room page's audience entry gate)
// land here with ?room=<roomId> — this is the ONE place that decides what
// happens next, so it has to actually look the room up and show the real
// entry flow for it, not a generic "browse everything live" wall.
function RoomAwareLobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRoomId = searchParams?.get('room') ?? null;

  const [status, setStatus] = useState<'loading' | 'found' | 'not-found' | 'none'>(
    requestedRoomId ? 'loading' : 'none',
  );
  const [room, setRoom] = useState<UniversalRoom | null>(null);

  useEffect(() => {
    if (!requestedRoomId) { setStatus('none'); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/live/go', { cache: 'no-store' });
        const data = await res.json() as { sessions?: LiveApiSession[] };
        const match = data.sessions?.find((s) => s.roomId === requestedRoomId);
        if (cancelled) return;
        if (match) {
          setRoom(sessionToRoom(match));
          setStatus('found');
        } else {
          setStatus('not-found');
        }
      } catch {
        if (!cancelled) setStatus('not-found');
      }
    })();
    return () => { cancelled = true; };
  }, [requestedRoomId]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[#050510] text-white p-8 flex items-center justify-center">
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: '0.1em' }}>FINDING YOUR ROOM…</p>
      </main>
    );
  }

  if (status === 'found' && room) {
    return (
      <main className="min-h-screen bg-[#050510] text-white">
        <LobbyEntryFlow room={room} onClose={() => router.push('/live/lobby')} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050510] text-white p-8">
      {status === 'not-found' && (
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 16 }}>
          That room isn&apos;t live anymore — here&apos;s what&apos;s live right now.
        </p>
      )}
      <BillboardLiveWall mode="home" maxTiles={18} title="TMI GLOBAL LIVE LOBBY" showActions />
    </main>
  );
}

export default function LiveLobbyRoute() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050510]" />}>
      <RoomAwareLobby />
    </Suspense>
  );
}
