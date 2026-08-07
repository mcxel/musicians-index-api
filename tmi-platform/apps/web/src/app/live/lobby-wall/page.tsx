'use client';

/**
 * /live/lobby-wall — All Live Stations wall.
 * Projects GlobalLiveSessionRegistry sessions (via GET /api/live/go) into
 * LiveSurfaceCard → LobbyRoom. No fake rooms / prize pools (Rule 20).
 */

import { useEffect, useState } from 'react';
import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallGrid, { type LobbyRoom } from '@/components/live/LiveLobbyWallGrid';
import type { LiveSession, StreamCategory } from '@/lib/broadcast/GlobalLiveSessionRegistry';
import {
  projectSessionsToSurfaceCards,
  type LiveSurfaceCard,
  type LiveSurfaceRuntimeType,
} from '@/lib/discovery/LiveSurfaceCard';

function runtimeToLobbyType(
  runtime: LiveSurfaceRuntimeType,
): LobbyRoom['type'] {
  if (runtime === 'battle') return 'battle';
  if (runtime === 'cypher') return 'cypher';
  if (runtime === 'challenge') return 'challenge';
  if (runtime === 'game' || runtime === 'session') return 'game';
  return 'live';
}

function legacyGenreToStreamCategory(genre: string | undefined): StreamCategory {
  const c = String(genre ?? 'live').toLowerCase().replace(/_/g, '-');
  if (c === 'battle' || c === 'battles') return 'battle';
  if (c === 'cypher' || c === 'cyphers') return 'cypher';
  if (c === 'challenge' || c === 'challenges') return 'challenge';
  if (c === 'concert' || c === 'concerts') return 'concert';
  if (c === 'game' || c === 'games' || c === 'game-show') return 'game';
  if (c === 'session') return 'session';
  return 'live';
}

function surfaceToLobbyRoom(card: LiveSurfaceCard): LobbyRoom {
  const type = runtimeToLobbyType(card.runtimeType);
  const status: LobbyRoom['status'] =
    card.state === 'live' || card.state === 'intermission'
      ? 'live'
      : card.state === 'starting' || card.state === 'pre_show'
        ? 'starting'
        : 'ended';

  return {
    id: card.roomId,
    name: card.title,
    performerName: card.subtitle,
    type,
    href: card.joinAction.href,
    viewerCount: card.audienceCount,
    status,
    genre: card.runtimeType,
    previewUrl: card.previewMediaUrl ?? null,
    // prizePool intentionally omitted — no honest prize publisher on this path
  };
}

export default function AllLiveLobbyWallPage() {
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/live/go', {
          cache: 'no-store',
          credentials: 'include',
        });
        const data = (await res.json()) as {
          sessions?: LiveSession[];
          live?: Array<{
            userId: string;
            displayName: string;
            genre: string;
            viewerCount: number;
            roomId?: string;
          }>;
        };

        if (cancelled) return;

        if (Array.isArray(data.sessions) && data.sessions.length > 0) {
          setRooms(
            projectSessionsToSurfaceCards(data.sessions).map(surfaceToLobbyRoom),
          );
          return;
        }

        // Fallback: legacy { live: [] } shape from same route — still real registry data
        const legacy = Array.isArray(data.live) ? data.live : [];
        const asSessions: LiveSession[] = legacy
          .filter((e) => e?.userId)
          .map((e) => ({
            userId: e.userId,
            displayName: e.displayName,
            avatarUrl: null,
            performerTier: 'free' as const,
            title: `${e.displayName} — Live`,
            category: legacyGenreToStreamCategory(e.genre),
            roomId: e.roomId ?? `room-${e.userId}`,
            previewUrl: null,
            thumbnailUrl: null,
            stageState: 'live' as const,
            streamHealth: 'unknown' as const,
            viewerCount: Math.max(0, Math.round(e.viewerCount ?? 0)),
            tipTotal: 0,
            privacy: 'PUBLIC' as const,
            entryPriceUsd: null,
            accentColor: '#00FFFF',
            startedAt: Date.now(),
            lastPingAt: Date.now(),
            bitrateKbps: 0,
            droppedFramesPct: 0,
            rttMs: 0,
            audioOk: true,
            audienceCountries: [],
            recentAudienceEntries: [],
            lastAudienceEntryAt: null,
            hostDisconnectedAt: null,
          }));
        setRooms(projectSessionsToSurfaceCards(asSessions).map(surfaceToLobbyRoom));
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
