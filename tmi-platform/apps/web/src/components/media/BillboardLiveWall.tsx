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
import { MaskedVideoTile, type TileShape } from '@/components/live/MaskedVideoTile';
import Link from 'next/link';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WallMode = 'home' | 'performer-hub' | 'fan-hub' | 'battle' | 'venue' | 'magazine';

interface PerformerSlot {
  id: string;
  name: string;
  slug: string;
  rank?: number;
  isLive: boolean;
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

// ─── Seeded performer data (replace with real API call) ───────────────────────

function seedPerformers(): PerformerSlot[] {
  return [
    { id: 'p1', name: 'Big Ace', slug: 'big-ace', rank: 1, isLive: true, viewerCount: 2147, genre: 'Hip-Hop', avatarEmoji: '🎤', accentColor: '#FFD700', sponsorCount: 7 },
    { id: 'p2', name: 'Lani Flame', slug: 'lani-flame', rank: 2, isLive: true, viewerCount: 1863, genre: 'R&B', avatarEmoji: '🔥', accentColor: '#FF2DAA', sponsorCount: 4 },
    { id: 'p3', name: 'DJ Blend', slug: 'dj-blend', rank: 3, isLive: true, viewerCount: 1204, genre: 'DJ', avatarEmoji: '🎧', accentColor: '#00FFFF', sponsorCount: 3 },
    { id: 'p4', name: 'Mia Jay', slug: 'mia-jay', rank: 4, isLive: false, viewerCount: 889, genre: 'Pop', avatarEmoji: '🎵', accentColor: '#AA2DFF', sponsorCount: 2 },
    { id: 'p5', name: 'Charro Ace', slug: 'charro-ace', rank: 5, isLive: true, viewerCount: 743, genre: 'Hip-Hop', avatarEmoji: '👑', accentColor: '#FF6B35', sponsorCount: 5 },
    { id: 'p6', name: 'Nova Sky', slug: 'nova-sky', rank: 6, isLive: false, viewerCount: 621, genre: 'R&B', avatarEmoji: '⭐', accentColor: '#00FF88', sponsorCount: 1 },
    { id: 'p7', name: 'Retro Rick', slug: 'retro-rick', rank: 7, isLive: true, viewerCount: 512, genre: 'Soul', avatarEmoji: '🎸', accentColor: '#FFB800', sponsorCount: 2 },
    { id: 'p8', name: 'Crystal Fizz', slug: 'crystal-fizz', rank: 8, isLive: false, viewerCount: 398, genre: 'EDM', avatarEmoji: '💎', accentColor: '#00C8FF', sponsorCount: 0 },
    { id: 'p9', name: 'Flow Jamz', slug: 'flow-jamz', rank: 9, isLive: true, viewerCount: 287, genre: 'Rap', avatarEmoji: '🎶', accentColor: '#FF4466', sponsorCount: 3 },
    { id: 'p10', name: 'Trina Sky', slug: 'trina-sky', rank: 10, isLive: false, viewerCount: 214, genre: 'Gospel', avatarEmoji: '🙏', accentColor: '#39FF14', sponsorCount: 1 },
    { id: 'p11', name: 'Max Flare', slug: 'max-flare', rank: 11, isLive: false, viewerCount: 189, genre: 'Rock', avatarEmoji: '⚡', accentColor: '#FF2DAA', sponsorCount: 0 },
    { id: 'p12', name: 'Urban Scholar', slug: 'urban-scholar', rank: 12, isLive: true, viewerCount: 152, genre: 'Hip-Hop', avatarEmoji: '📚', accentColor: '#AA2DFF', sponsorCount: 2 },
    { id: 'p13', name: 'Darkwave Diva', slug: 'darkwave-diva', rank: 13, isLive: false, viewerCount: 131, genre: 'Alt', avatarEmoji: '🌑', accentColor: '#00FFFF', sponsorCount: 1 },
    { id: 'p14', name: 'Poptronica', slug: 'poptronica', rank: 14, isLive: true, viewerCount: 98, genre: 'Pop', avatarEmoji: '🎀', accentColor: '#FFD700', sponsorCount: 4 },
    { id: 'p15', name: 'NightRider', slug: 'night-rider', rank: 15, isLive: false, viewerCount: 76, genre: 'Beats', avatarEmoji: '🌙', accentColor: '#FF6B35', sponsorCount: 0 },
    { id: 'p16', name: 'Yung Tuck', slug: 'yung-tuck', rank: 16, isLive: false, viewerCount: 64, genre: 'Rap', avatarEmoji: '🤙', accentColor: '#00FF88', sponsorCount: 2 },
    { id: 'p17', name: 'Diana Electro', slug: 'diana-electro', rank: 17, isLive: true, viewerCount: 52, genre: 'EDM', avatarEmoji: '💙', accentColor: '#00C8FF', sponsorCount: 1 },
    { id: 'p18', name: 'Bobby Stanley', slug: 'bobby-stanley', rank: 18, isLive: false, viewerCount: 41, genre: 'Host', avatarEmoji: '🎙️', accentColor: '#FFB800', sponsorCount: 3 },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillboardLiveWall({
  mode = 'home',
  maxTiles = 12,
  showActions = false,
  forceShape,
  title,
  className = '',
}: BillboardLiveWallProps) {
  const [performers, setPerformers] = useState<PerformerSlot[]>([]);
  const [justJoinedIdx, setJustJoinedIdx] = useState<number | null>(null);
  const [activeFlowRoom, setActiveFlowRoom] = useState<UniversalRoom | null>(null);

  // Load + sort performers: live first, then by rank
  useEffect(() => {
    const all = seedPerformers();
    const sorted = [...all].sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return (a.rank ?? 99) - (b.rank ?? 99);
    });
    setPerformers(sorted.slice(0, maxTiles));
  }, [maxTiles]);

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

  if (performers.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
        Loading performers…
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
                isLive={p.isLive}
                viewerCount={p.viewerCount}
                genre={p.genre}
                accentColor={p.accentColor ?? ACCENT_PALETTE[i % ACCENT_PALETTE.length]}
                size={tileSize}
                avatarEmoji={p.avatarEmoji}
                avatarUrl={p.avatarUrl}
                showActions={showActions}
                onJoin={showActions ? () => handleJoinClick(p) : undefined}
                onTip={showActions ? () => alert(`Tip ${p.name}`) : undefined}
                onMessage={showActions ? () => alert(`Message ${p.name}`) : undefined}
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
