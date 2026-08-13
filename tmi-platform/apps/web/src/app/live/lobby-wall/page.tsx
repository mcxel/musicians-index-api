'use client';

/**
 * /live/lobby-wall — All Live Stations wall.
 * Projects GlobalLiveSessionRegistry sessions (via GET /api/live/go) into
 * LiveSurfaceCard → LobbyRoom. No fake rooms / prize pools (Rule 20).
 *
 * 2026-08-12: added the category pill row from the Lobbies wall design
 * reference. "Games"/"Challenges"/"Ciphers"/"Lounges" filter the same real
 * session list by StreamCategory (client-side — no extra request). "Avatars"
 * and "Playlists" are not live sessions at all, so they fetch their own real
 * sources (/api/yopho/cards, /api/playlists) and render through
 * LiveLobbyWallGrid's overrideContent slot instead of being forced through
 * LobbyRoom/LobbyCell.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallGrid, { type LobbyRoom } from '@/components/live/LiveLobbyWallGrid';
import type { LobbyCategoryPill } from '@/components/lobby/LobbyCategoryPillRow';
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
  if (c === 'lounge' || c === 'lounges') return 'lounge';
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

// ─── Category pill definitions ─────────────────────────────────────────────
// "live-now" shows every session unfiltered (matches the existing "All Live
// Stations" default). The others filter the same real session list by its
// actual StreamCategory — no separate fetch. Avatars/Playlists are the two
// non-live-session sources.

type CategoryId = 'live-now' | 'game' | 'challenge' | 'cypher' | 'lounge' | 'avatars' | 'playlists';

const CATEGORY_PILLS: LobbyCategoryPill[] = [
  { id: 'live-now', label: 'Live Now', icon: '🔴', accentColor: '#00FF88' },
  { id: 'game', label: 'Games', icon: '🎮', accentColor: '#00FFFF' },
  { id: 'challenge', label: 'Challenges', icon: '⚔️', accentColor: '#FF6B35' },
  { id: 'cypher', label: 'Ciphers', icon: '🎤', accentColor: '#AA2DFF' },
  { id: 'lounge', label: 'Lounges', icon: '🛋️', accentColor: '#FF2DAA' },
  { id: 'avatars', label: 'Avatars', icon: '✨', accentColor: '#FFD700' },
  { id: 'playlists', label: 'Playlists', icon: '🎵', accentColor: '#38bdf8' },
];

type YoPhoCardSummary = {
  cardId: string;
  displayName: string;
  subjectUrl: string;
  moodTitle?: string | null;
  momentTag?: string | null;
};

type PlaylistSummary = {
  id: string;
  name: string;
  type: string;
  trackCount: number;
};

export default function AllLiveLobbyWallPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('live-now');

  const [yophoCards, setYophoCards] = useState<YoPhoCardSummary[] | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistSummary[] | null>(null);

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
          setSessions(data.sessions);
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
        setSessions(asSessions);
      } catch {
        if (!cancelled) setSessions([]);
      }
    };
    void load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Lazy-load the two non-live sources only once their tab is actually selected.
  useEffect(() => {
    if (activeCategory === 'avatars' && yophoCards === null) {
      fetch('/api/yopho/cards', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d: { cards?: YoPhoCardSummary[] }) => setYophoCards(Array.isArray(d.cards) ? d.cards : []))
        .catch(() => setYophoCards([]));
    }
    if (activeCategory === 'playlists' && playlists === null) {
      fetch('/api/playlists', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d: { playlists?: PlaylistSummary[] }) => setPlaylists(Array.isArray(d.playlists) ? d.playlists : []))
        .catch(() => setPlaylists([]));
    }
  }, [activeCategory, yophoCards, playlists]);

  const rooms = useMemo(() => {
    const filtered =
      activeCategory === 'live-now'
        ? sessions
        : activeCategory === 'game' || activeCategory === 'challenge' || activeCategory === 'cypher' || activeCategory === 'lounge'
          ? sessions.filter((s) => s.category === activeCategory)
          : []; // avatars/playlists render via overrideContent, not the room grid
    return projectSessionsToSurfaceCards(filtered).map(surfaceToLobbyRoom);
  }, [sessions, activeCategory]);

  const overrideContent = useMemo(() => {
    if (activeCategory === 'avatars') {
      if (yophoCards === null) {
        return <CategoryLoading label="Loading YoPho canvases…" />;
      }
      if (yophoCards.length === 0) {
        return <CategoryEmpty icon="✨" title="No YoPho canvases yet" subtitle="Published canvases will appear here." />;
      }
      return (
        <CardGrid>
          {yophoCards.map((card) => (
            <YoPhoTile key={card.cardId} card={card} />
          ))}
        </CardGrid>
      );
    }
    if (activeCategory === 'playlists') {
      if (playlists === null) {
        return <CategoryLoading label="Loading playlists…" />;
      }
      if (playlists.length === 0) {
        return <CategoryEmpty icon="🎵" title="No playlists yet" subtitle="Platform playlists will appear here." />;
      }
      return (
        <CardGrid>
          {playlists.map((p) => (
            <PlaylistTile key={p.id} playlist={p} />
          ))}
        </CardGrid>
      );
    }
    return undefined;
  }, [activeCategory, yophoCards, playlists]);

  return (
    <>
      <GlobalTopNavRail />
      <LiveLobbyWallGrid
        rooms={rooms}
        title="All Live Stations"
        accentColor="#00FF88"
        typeLabel="ALL LIVE"
        categoryPills={{
          items: CATEGORY_PILLS,
          activeId: activeCategory,
          onSelect: (id) => setActiveCategory(id as CategoryId),
        }}
        overrideContent={overrideContent}
      />
    </>
  );
}

// ─── Non-room category rendering (Avatars / Playlists) ─────────────────────

function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

function CategoryLoading({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.35)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
      <div style={{ fontWeight: 800, fontSize: 16 }}>{label}</div>
    </div>
  );
}

function CategoryEmpty({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.35)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
      <div style={{ fontSize: 13, marginTop: 6 }}>{subtitle}</div>
    </div>
  );
}

function YoPhoTile({ card }: { card: YoPhoCardSummary }) {
  return (
    <a
      href={`/yopho/card/${encodeURIComponent(card.cardId)}`}
      style={{
        position: 'relative',
        display: 'block',
        borderRadius: 12,
        aspectRatio: '4/3',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        textDecoration: 'none',
        background: '#0a0614',
      }}
    >
      {card.subjectUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.subjectUrl} alt={card.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          fontSize: 8,
          fontWeight: 800,
          letterSpacing: '0.15em',
          color: '#000',
          background: '#FFD700',
          padding: '2px 6px',
          borderRadius: 3,
        }}
      >
        YO!PHO CANVAS
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
          padding: '16px 8px 8px',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{card.displayName}</div>
        {(card.moodTitle || card.momentTag) && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
            {card.momentTag ?? card.moodTitle}
          </div>
        )}
      </div>
    </a>
  );
}

function PlaylistTile({ playlist }: { playlist: PlaylistSummary }) {
  // No real per-playlist detail route exists yet (/playlist is a fixed,
  // param-less "my playlist" page — confirmed 2026-08-12). Rendered as a
  // real-data card, not a fake link to a page that doesn't exist (Rule 14/20).
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        borderRadius: 12,
        aspectRatio: '4/3',
        overflow: 'hidden',
        border: '1px solid rgba(56,189,248,0.25)',
        background: 'radial-gradient(circle at 50% 40%, rgba(56,189,248,0.12), #050510 70%)',
      }}
    >
      <div style={{ padding: '16px 12px 12px', width: '100%' }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: '#38bdf8', marginBottom: 4 }}>
          🎵 PLAYLIST
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{playlist.name}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          {playlist.trackCount} track{playlist.trackCount === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
}
