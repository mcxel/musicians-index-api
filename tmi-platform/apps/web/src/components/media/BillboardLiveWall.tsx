'use client';

/**
 * BillboardLiveWall — TMI Billboard Live Lobby Wall
 *
 * WHAT: Chaotic, shape-shifted performer grid.
 *       Streaming performers first, then seeded filler.
 *       Every card is a MaskedVideoTile with a randomized shape.
 *
 * WHERE TO PUT THIS FILE:
 *   apps/web/src/components/media/BillboardLiveWall.tsx
 *
 * USAGE:
 *   <BillboardLiveWall mode="home" maxTiles={12} />
 *   <BillboardLiveWall mode="performer-hub" maxTiles={18} showActions />
 *   <BillboardLiveWall mode="battle" maxTiles={6} forceShape="hexagon" />
 */

import { useEffect, useState, useCallback } from 'react';
import { MaskedVideoTile, type TileShape, type BroadcastTileStatus } from '@/components/live/MaskedVideoTile';
import Link from 'next/link';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';
import { PERFORMER_REGISTRY } from '@/lib/performers/PerformerRegistry';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WallMode = 'home' | 'performer-hub' | 'fan-hub' | 'battle' | 'venue' | 'magazine';

interface PerformerSlot {
  id: string;
  name: string;
  slug: string;
  rank?: number;
  broadcastStatus?: BroadcastTileStatus;
  isLive?: boolean;
  viewerCount: number;
  genre?: string;
  streamUrl?: string;
  avatarEmoji?: string;
  avatarUrl?: string;
  accentColor?: string;
  sponsorCount?: number;
}

interface BillboardLiveWallProps {
  mode?: WallMode;
  maxTiles?: number;
  showActions?: boolean;
  forceShape?: TileShape;
  /** Title shown above the wall */
  title?: string;
  className?: string;
  /** Filter to a single GlobalLiveSessionRegistry category (battle/cypher/concert/challenge/live/game/session) */
  category?: string;
}

interface LiveApiSession {
  userId: string;
  displayName: string;
  category: string;
  roomId: string;
  viewerCount: number;
  avatarUrl: string | null;
  accentColor: string;
}

// ─── Shape rotation by mode ───────────────────────────────────────────────────

const MODE_SHAPES: Record<WallMode, TileShape[]> = {
  home:           ['octagon', 'hexagon', 'pentagon', 'octagon', 'circle', 'diamond', 'octagon', 'torn-edge', 'hexagon'],
  'performer-hub': ['hexagon', 'octagon', 'hexagon', 'pentagon', 'hexagon', 'octagon'],
  'fan-hub':       ['circle', 'octagon', 'pentagon', 'circle', 'hexagon', 'octagon'],
  battle:          ['hexagon', 'glitch-rect', 'hexagon', 'pentagon', 'hexagon', 'glitch-rect'],
  venue:           ['pentagon', 'octagon', 'circle', 'pentagon', 'octagon', 'circle'],
  magazine:        ['torn-edge', 'octagon', 'torn-edge', 'hexagon', 'torn-edge', 'pentagon'],
};

// ─── Accent colour table ──────────────────────────────────────────────────────

const ACCENT_PALETTE = [
  '#00FFFF', '#FF2DAA', '#FFD700', '#00FF88', '#AA2DFF', '#FF6B35',
  '#00C8FF', '#FF4466', '#39FF14', '#FFB800',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillboardLiveWall({
  mode = 'home',
  maxTiles = 12,
  showActions = false,
  forceShape,
  title,
  className = '',
  category,
}: BillboardLiveWallProps) {
  const [performers, setPerformers] = useState<PerformerSlot[]>([]);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [justJoinedIdx, setJustJoinedIdx] = useState<number | null>(null);
  const [activeFlowRoom, setActiveFlowRoom] = useState<UniversalRoom | null>(null);

  // Real liveness from GlobalLiveSessionRegistry (via /api/live/go) — live tiles first,
  // then PERFORMER_REGISTRY fills remaining slots as honestly-offline discovery tiles.
  // Never fabricates "isLive" from array index — Rule 14.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      let sessions: LiveApiSession[] = [];
      try {
        const res = await fetch('/api/live/go', { cache: 'no-store' });
        const data = await res.json() as { sessions?: LiveApiSession[] };
        sessions = data.sessions ?? [];
      } catch {
        sessions = [];
      }
      if (cancelled) return;

      const filtered = category ? sessions.filter((s) => s.category === category) : sessions;

      const liveTiles: PerformerSlot[] = filtered.map((s, i) => ({
        id: s.userId,
        name: s.displayName,
        slug: s.userId,
        broadcastStatus: 'live' as const,
        isLive: true,
        viewerCount: s.viewerCount,
        genre: s.category,
        avatarEmoji: '🎤',
        avatarUrl: s.avatarUrl ?? undefined,
        accentColor: s.accentColor || ACCENT_PALETTE[i % ACCENT_PALETTE.length],
        sponsorCount: 0,
      }));

      const liveIds = new Set(liveTiles.map((t) => t.id));
      const offline: PerformerSlot[] = category
        ? [] // category-filtered walls only show real sessions in that category
        : (PERFORMER_REGISTRY as any[])
            .filter((p) => !liveIds.has(p.id))
            .map((p, i): PerformerSlot => ({
              id: p.id,
              name: p.name,
              slug: p.slug ?? p.id,
              rank: p.rank ?? (i + 1),
              broadcastStatus: 'offline' as const,
              // No longer ambiguous: 'offline' means real performer, not someone
              // whose session ended. MaskedVideoTile will show discovery card, not
              // "Broadcast Ended" (Rule 14/20 compliance).
              viewerCount: p.audienceCount ?? p.fanCount ?? 0,
              genre: p.category ?? p.genre ?? 'Live',
              avatarEmoji: p.avatarEmoji ?? '👤',
              avatarUrl: p.profileImageUrl ?? p.avatarUrl,
              accentColor: ACCENT_PALETTE[i % ACCENT_PALETTE.length],
              sponsorCount: 0,
            }))
            .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

      setPerformers([...liveTiles, ...offline].slice(0, maxTiles));
      setLoadedOnce(true);
    };

    void load();
    const id = setInterval(() => void load(), 8000);
    return () => { cancelled = true; clearInterval(id); };
  }, [maxTiles, category]);

  // "Just joined" flash every 9s
  useEffect(() => {
    const id = setInterval(() => {
      setJustJoinedIdx(Math.floor(Math.random() * performers.length));
      setTimeout(() => setJustJoinedIdx(null), 2800);
    }, 9000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [performers.length]);

  const shapes = MODE_SHAPES[mode];
  const getShape = useCallback(
    (i: number): TileShape => forceShape ?? shapes[i % shapes.length]!,
    [forceShape, shapes],
  );

  // Tile sizes: first card is featured (larger), rest standard
  const getFeaturedSize = (i: number) => {
    if (mode === 'home' && i === 0) return 240;
    return 170;
  };

  const handleJoinClick = (p: PerformerSlot) => {
    setActiveFlowRoom({
      id: p.id,
      title: `${p.name} — Live`,
      hostName: p.name,
      hostEmoji: p.avatarEmoji,
      genre: p.genre ?? 'Live',
      viewers: p.viewerCount,
      status: p.isLive ? 'live' : 'upcoming',
      access: 'free',
      accentColor: p.accentColor ?? '#00FFFF',
      roomRoute: `/live/rooms/${p.id}`,
      venueIndex: 0,
    });
  };

  if (!loadedOnce) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
        Loading performers…
      </div>
    );
  }

  if (performers.length === 0) {
    return (
      <div style={{ padding: 20, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, background: 'rgba(5,5,16,0.65)' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          No Live Billboard Rooms
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
          Start a room or browse available arenas.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/live/lobby" style={{ textDecoration: 'none', padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(0,255,255,0.5)', color: '#00FFFF', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em' }}>JOIN ARENA</Link>
          <Link href="/performers" style={{ textDecoration: 'none', padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,215,0,0.5)', color: '#FFD700', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em' }}>BROWSE PERFORMERS</Link>
          <Link href="/live/rooms/new" style={{ textDecoration: 'none', padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,45,170,0.5)', color: '#FF2DAA', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em' }}>CREATE ROOM</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%' }}>
      {activeFlowRoom && <LobbyEntryFlow room={activeFlowRoom} onClose={() => setActiveFlowRoom(null)} />}

      {/* ── Header ── */}
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
            padding: '0 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 4,
                height: 18,
                background: 'linear-gradient(180deg, #FFD700, #FF2DAA)',
                borderRadius: 2,
                boxShadow: '0 0 8px #FFD700',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '0.2em',
                color: '#fff',
                textTransform: 'uppercase',
              }}
            >
              {title}
            </span>
            <span
              style={{
                fontSize: 8,
                fontWeight: 900,
                color: '#FF2020',
                background: 'rgba(255,32,32,0.12)',
                border: '1px solid rgba(255,32,32,0.3)',
                borderRadius: 4,
                padding: '2px 8px',
                letterSpacing: '0.1em',
              }}
            >
              ● LIVE
            </span>
          </div>
          <Link
            href="/live/rooms"
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#00FFFF',
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            VIEW ALL →
          </Link>
        </div>
      )}

      {/* ── Grid ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          justifyContent: 'flex-start',
        }}
      >
        {performers.map((p, i) => {
          const tileSize = getFeaturedSize(i);
          const isFlashing = justJoinedIdx === i;

          return (
            <div key={p.id} style={{ position: 'relative' }}>
              {/* "Just joined" flash badge */}
              {isFlashing && (
                <div
                  style={{
                    position: 'absolute',
                    top: -18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#00FF88',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: 8,
                    fontWeight: 900,
                    color: '#050510',
                    letterSpacing: '0.1em',
                    whiteSpace: 'nowrap',
                    zIndex: 30,
                    boxShadow: '0 0 10px #00FF88',
                    animation: 'tmiJoinPop 0.3s cubic-bezier(0.7,0,0.3,1)',
                  }}
                >
                  🎤 JUST JOINED
                </div>
              )}

              <MaskedVideoTile
                shape={getShape(i)}
                streamUrl={p.streamUrl}
                performerName={p.name}
                performerSlug={p.slug}
                rank={p.rank}
                broadcastStatus={p.broadcastStatus}
                isLive={p.isLive}
                viewerCount={p.viewerCount}
                genre={p.genre}
                accentColor={p.accentColor ?? ACCENT_PALETTE[i % ACCENT_PALETTE.length]}
                size={tileSize}
                avatarEmoji={p.avatarEmoji}
                avatarUrl={p.avatarUrl}
                showActions={showActions}
                onJoin={showActions ? () => handleJoinClick(p) : undefined}
                onTip={showActions ? () => { window.location.href = `/checkout?type=tip&artist=${encodeURIComponent(p.slug ?? p.name)}&amount=500&productName=${encodeURIComponent(`Tip for ${p.name}`)}`; } : undefined}
                onMessage={showActions ? () => { window.location.href = `/messages/new?to=${encodeURIComponent(p.slug ?? p.name)}`; } : undefined}
              />

              {/* Sponsor strip below performer hub tiles */}
              {mode === 'performer-hub' && p.sponsorCount !== undefined && (
                <div
                  style={{
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    fontSize: 8,
                  }}
                >
                  {p.sponsorCount > 0 ? (
                    <>
                      <span style={{ color: '#FFD700' }}>🤝</span>
                      <span style={{ color: '#FFD700', fontWeight: 700 }}>
                        {p.sponsorCount} sponsors
                      </span>
                      <Link
                        href={`/hub/sponsor?target=performer&slug=${p.slug}`}
                        style={{
                          color: '#00FFFF',
                          fontWeight: 700,
                          textDecoration: 'none',
                          fontSize: 8,
                        }}
                      >
                        Sponsor →
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/hub/sponsor?target=performer&slug=${p.slug}`}
                      style={{
                        color: 'rgba(255,255,255,0.3)',
                        fontWeight: 700,
                        textDecoration: 'none',
                        fontSize: 8,
                      }}
                    >
                      + Be First Sponsor
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Join CTA ── */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <Link
          href="/live/lobby"
          style={{
            padding: '8px 20px',
            background: 'linear-gradient(90deg, #00FFFF, #00C8FF)',
            borderRadius: 8,
            fontSize: 9,
            fontWeight: 900,
            color: '#050510',
            textDecoration: 'none',
            letterSpacing: '0.1em',
            boxShadow: '0 0 14px rgba(0,255,255,0.35)',
          }}
        >
          JOIN LOBBY →
        </Link>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>
          {performers.filter((p) => p.isLive).length} performers live now
        </span>
      </div>

      <style>{`
        @keyframes tmiJoinPop {
          0% { transform: translateX(-50%) scale(0.6); opacity: 0; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
