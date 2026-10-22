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
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallHost from '@/components/live/LiveLobbyWallHost';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';
import { useGlobalLiveSessions } from '@/hooks/useGlobalLiveSessions';
import type { TripletEventItem } from '@/lib/competition/TripleEventBroadcastEngine';
import { LOBBY_WALL_CHANNEL_TABS, type LobbyWallCoreCategoryId } from '@/lib/lobby/liveLobbyWallLaw';

function SelectedRecruitment({ eventId, intent }: { eventId: string; intent: string | null }) {
  const [event, setEvent] = useState<TripletEventItem | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setEvent(null);
    const load = async () => {
      try {
        const response = await fetch('/api/competition/triplet-broadcast', { cache: 'no-store' });
        if (!response.ok) throw new Error('Broadcast unavailable');
        const body = (await response.json()) as { ok?: boolean; events?: TripletEventItem[] };
        if (cancelled) return;
        const selected = body.ok ? body.events?.find((item) => item.id === eventId) ?? null : null;
        setEvent(selected);
        setStatus(selected && selected.expiresAt > Date.now() ? 'ready' : 'unavailable');
      } catch {
        if (!cancelled) setStatus('unavailable');
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [eventId]);

  useEffect(() => {
    if (status !== 'ready' || !event) return;
    const timer = window.setTimeout(() => setStatus('unavailable'), Math.max(0, event.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [event, status]);

  return (
    <main data-testid="selected-recruitment" data-event-id={eventId} style={{ minHeight: '70vh', background: '#050510', color: '#fff', padding: '32px max(20px, 5vw)' }}>
      <Link href="/rooms" data-testid="selected-recruitment-return" style={{ color: '#00FFFF', fontWeight: 800 }}>← BACK TO ROOMS</Link>
      {status === 'loading' ? <p role="status">Loading recruitment…</p> : null}
      {status === 'unavailable' ? <p role="status">This recruitment opportunity is no longer available.</p> : null}
      {status === 'ready' && event ? (
        <section aria-label={`${event.title} recruitment`} style={{ marginTop: 28, maxWidth: 640 }}>
          <div style={{ color: '#FFD700', fontSize: 12, fontWeight: 800 }}>RECRUITING · {event.category.toUpperCase()}</div>
          <h1 style={{ fontSize: 28, margin: '12px 0' }}>{event.title}</h1>
          <p>{event.axis} · {event.genre} · {event.skill}</p>
          <p>{intent === 'participate' ? 'Performer recruitment is open. Participant enrollment is not available from this view yet.' : 'This event is recruiting. No live room has formed yet.'}</p>
        </section>
      ) : null}
    </main>
  );
}

function RoomDeepLinkEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRoomId = searchParams?.get('room') ?? null;
  const requestedEventId = searchParams?.get('eventId') ?? null;
  const requestedCategory = searchParams?.get('category') ?? null;
  const defaultCategory = LOBBY_WALL_CHANNEL_TABS.some((tab) => tab.id === requestedCategory)
    ? requestedCategory as LobbyWallCoreCategoryId
    : 'all';
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
      return;
    }

    if (!requestedRoomId) {
      setRoom(null);
      setStatus('not-found');
      return;
    }

    // Not a live-stream session — check the canonical LobbyEvent table
    // (Mini Battles/Challenges/etc.) before giving up. A freshly created
    // Mini Battle/Challenge never appears in GlobalLiveSessionRegistry, so
    // without this the exact roomId dead-ended here (2026-09-22 audit).
    let cancelled = false;
    fetch(`/api/rooms/lobby-event?roomId=${encodeURIComponent(requestedRoomId)}`)
      .then((res) => res.json())
      .then((data: { ok?: boolean; found?: boolean; room?: { roomId: string; title: string; genreName: string; viewerCount: number; format: string } }) => {
        if (cancelled) return;
        if (data.ok && data.found && data.room) {
          setRoom({
            id: data.room.roomId,
            title: data.room.title,
            hostName: data.room.title,
            genre: data.room.genreName,
            viewers: data.room.viewerCount,
            status: 'live',
            access: 'free',
            accentColor: '#00FFFF',
            roomRoute: `/live/rooms/${data.room.roomId}`,
            venueIndex: 0,
          });
          setStatus('found');
        } else {
          setRoom(null);
          setStatus('not-found');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRoom(null);
          setStatus('not-found');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [requestedRoomId, modeRandom, liveSessions]);

  if (requestedEventId && searchParams?.get('from') === 'rooms-portal') {
    return <SelectedRecruitment eventId={requestedEventId} intent={searchParams.get('intent')} />;
  }

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
        defaultCategory={defaultCategory}
        enableMobileRoam
      />
    </>
  );
}

export default function AllLiveLobbyWallPage() {
  return (
    <>
      <GlobalTopNavRail />
      <nav aria-label="More live experiences" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px 20px', background: '#050510' }}>
        <Link href="/live/rooms/stream-win" style={{ color: '#FFD700', fontSize: 12, fontWeight: 800 }}>Stream &amp; Win Radio</Link>
        <Link href="/video-shuffle" style={{ color: '#00FFFF', fontSize: 12, fontWeight: 800 }}>Video Shuffle</Link>
      </nav>
      <Suspense fallback={<main className="min-h-screen bg-[#050510]" />}>
        <RoomDeepLinkEntry />
      </Suspense>
    </>
  );
}
