'use client';

import { useEffect, useState, useCallback } from 'react';
import MaskedVideoTile, { type TileShape } from './MaskedVideoTile';
import Link from 'next/link';
import type { LiveFeedItem } from '@/components/billboard/TMIBillboardLiveWall';

export type WallMode = 'home' | 'performer-hub' | 'fan-hub' | 'battle' | 'venue' | 'magazine';

interface PerformerSlot {
  id: string;
  name: string;
  slug: string;
  rank?: number;
  isLive: boolean;
  viewerCount: number;
  roomCount?: number;
  genre?: string;
  streamUrl?: string;
  profileVideoUrl?: string;
  avatarEmoji?: string;
  avatarUrl?: string;
  profileImageUrl?: string;
  articleHeroImageUrl?: string;
  accentColor?: string;
  sponsorCount?: number;
  country?: string;
  countryName?: string;
  liveStartedAt?: string;
  motionAssetUrl?: string;
}

export interface BillboardLiveWallProps {
  mode?: WallMode;
  maxTiles?: number;
  showActions?: boolean;
  forceShape?: TileShape;
  title?: string;
  className?: string;
}

const MODE_SHAPES: Record<WallMode, TileShape[]> = {
  home:           ['octagon', 'hexagon', 'pentagon', 'octagon', 'circle', 'diamond', 'octagon', 'torn-edge', 'hexagon'],
  'performer-hub': ['hexagon', 'octagon', 'hexagon', 'pentagon', 'hexagon', 'octagon'],
  'fan-hub':       ['circle', 'octagon', 'pentagon', 'circle', 'hexagon', 'octagon'],
  battle:          ['hexagon', 'glitch-rect', 'hexagon', 'pentagon', 'hexagon', 'glitch-rect'],
  venue:           ['pentagon', 'octagon', 'circle', 'pentagon', 'octagon', 'circle'],
  magazine:        ['torn-edge', 'octagon', 'torn-edge', 'hexagon', 'torn-edge', 'pentagon'],
};

const ACCENT_PALETTE = [
  '#00FFFF', '#FF2DAA', '#FFD700', '#00FF88', '#AA2DFF', '#FF6B35',
  '#00C8FF', '#FF4466', '#39FF14', '#FFB800',
];

const DEFAULT_GENRE_IMAGES: Record<string, string> = {
  'Hip-Hop': '/images/genres/hiphop-default.jpg',
  'R&B': '/images/genres/rnb-default.jpg',
  DJ: '/images/genres/dj-default.jpg',
  Pop: '/images/genres/pop-default.jpg',
  Rap: '/images/genres/rap-default.jpg',
  Gospel: '/images/genres/gospel-default.jpg',
  EDM: '/images/genres/edm-default.jpg',
  Soul: '/images/genres/soul-default.jpg',
};

const SAFE_PLACEHOLDER_IMAGE = '/images/placeholder-performer.jpg';

// Extracted static sponsor assets for dynamic rotation
const SPONSOR_ASSETS = [
  '/tmi-source/Profiles/Advertiser and sponser hub.jpg',
  '/tmi-source/Profiles/Sponsor Sign up.png',
  '/tmi-source/Profiles/Advertiser Sign up.png',
  '/tmi-source/Profiles/season Pass.jpg'
];

const TICKER_MESSAGES = [
  "🎤 ALL PERFORMERS WELCOME",
  "😂 DIGITAL COMEDY NIGHT NEEDS COMEDIANS",
  "💃 ALL DANCE STYLES ACCEPTED",
  "🕺 BRING YOUR DANCE CREW",
  "🎧 DJs WANTED",
  "🎹 PRODUCERS WANTED",
  "🎭 ACTORS WELCOME",
  "🎪 MAGICIANS WELCOME",
  "🌎 FREE GLOBAL PROMOTION AVAILABLE",
  "📢 ADVERTISE STARTING AT $25",
  "🤝 SPONSORS WANTED",
  "🎟️ SELL TICKETS",
  "💰 EARN TIPS LIVE",
  "🏆 CLIMB THE RANKINGS",
  "🚀 FOUNDING MEMBERS GET THE BEST POSITIONS"
];

function resolveMediaAsset(slot: PerformerSlot) {
  const genreDefault = slot.genre ? DEFAULT_GENRE_IMAGES[slot.genre] : undefined;
  return (
    slot.motionAssetUrl ||
    slot.profileVideoUrl ||
    slot.avatarUrl ||
    slot.profileImageUrl ||
    slot.articleHeroImageUrl ||
    genreDefault ||
    SAFE_PLACEHOLDER_IMAGE
  );
}

function seedPerformers(): PerformerSlot[] {
  const now = Date.now();
  return [
    { id: 'p1', name: 'Big Ace', slug: 'big-ace', rank: 1, isLive: true, viewerCount: 2147, genre: 'Hip-Hop', avatarEmoji: '🎤', accentColor: '#FFD700', sponsorCount: 7, country: '🇺🇸', liveStartedAt: new Date(now - 45 * 60000).toISOString() },
    { id: 'p2', name: 'Lani Flame', slug: 'lani-flame', rank: 2, isLive: true, viewerCount: 1863, genre: 'R&B', avatarEmoji: '🔥', accentColor: '#FF2DAA', sponsorCount: 4, country: '🇬🇧', liveStartedAt: new Date(now - 120 * 60000).toISOString() },
    { id: 'p3', name: 'DJ Blend', slug: 'dj-blend', rank: 3, isLive: true, viewerCount: 1204, genre: 'DJ', avatarEmoji: '🎧', accentColor: '#00FFFF', sponsorCount: 3, country: '🇨🇦', liveStartedAt: new Date(now - 15 * 60000).toISOString() },
    { id: 'p4', name: 'Mia Jay', slug: 'mia-jay', rank: 4, isLive: false, viewerCount: 889, genre: 'Pop', avatarEmoji: '🎵', accentColor: '#AA2DFF', sponsorCount: 2, country: '🇯🇲' },
    { id: 'p5', name: 'Charro Ace', slug: 'charro-ace', rank: 5, isLive: true, viewerCount: 743, genre: 'Hip-Hop', avatarEmoji: '👑', accentColor: '#FF6B35', sponsorCount: 5, country: '🇲🇽', liveStartedAt: new Date(now - 8 * 60000).toISOString() },
    { id: 'p6', name: 'Nova Sky', slug: 'nova-sky', rank: 6, isLive: false, viewerCount: 621, genre: 'R&B', avatarEmoji: '⭐', accentColor: '#00FF88', sponsorCount: 1, country: '🇺🇸' },
    { id: 'p7', name: 'Retro Rick', slug: 'retro-rick', rank: 7, isLive: true, viewerCount: 512, genre: 'Soul', avatarEmoji: '🎸', accentColor: '#FFB800', sponsorCount: 2, country: '🇦🇺', liveStartedAt: new Date(now - 200 * 60000).toISOString() },
    { id: 'p8', name: 'Crystal Fizz', slug: 'crystal-fizz', rank: 8, isLive: false, viewerCount: 398, genre: 'EDM', avatarEmoji: '💎', accentColor: '#00C8FF', sponsorCount: 0, country: '🇸🇪' },
    { id: 'p9', name: 'Flow Jamz', slug: 'flow-jamz', rank: 9, isLive: true, viewerCount: 287, genre: 'Rap', avatarEmoji: '🎶', accentColor: '#FF4466', sponsorCount: 3, country: '🇺🇸', liveStartedAt: new Date(now - 34 * 60000).toISOString() },
    { id: 'p10', name: 'Trina Sky', slug: 'trina-sky', rank: 10, isLive: false, viewerCount: 214, genre: 'Gospel', avatarEmoji: '🙏', accentColor: '#39FF14', sponsorCount: 1, country: '🇿🇦' },
    { id: 'p11', name: 'Max Flare', slug: 'max-flare', rank: 11, isLive: false, viewerCount: 189, genre: 'Rock', avatarEmoji: '⚡', accentColor: '#FF2DAA', sponsorCount: 0, country: '🇩🇪' },
    { id: 'p12', name: 'Urban Scholar', slug: 'urban-scholar', rank: 12, isLive: true, viewerCount: 152, genre: 'Hip-Hop', avatarEmoji: '📚', accentColor: '#AA2DFF', sponsorCount: 2, country: '🇺🇸', liveStartedAt: new Date(now - 90 * 60000).toISOString() },
    { id: 'p13', name: 'Darkwave Diva', slug: 'darkwave-diva', rank: 13, isLive: false, viewerCount: 131, genre: 'Alt', avatarEmoji: '🌑', accentColor: '#00FFFF', sponsorCount: 1, country: '🇫🇷' },
    { id: 'p14', name: 'Poptronica', slug: 'poptronica', rank: 14, isLive: true, viewerCount: 98, genre: 'Pop', avatarEmoji: '🎀', accentColor: '#FFD700', sponsorCount: 4, country: '🇯🇵', liveStartedAt: new Date(now - 12 * 60000).toISOString() },
    { id: 'p15', name: 'NightRider', slug: 'night-rider', rank: 15, isLive: false, viewerCount: 76, genre: 'Beats', avatarEmoji: '🌙', accentColor: '#FF6B35', sponsorCount: 0, country: '🇺🇸' },
    { id: 'p16', name: 'Yung Tuck', slug: 'yung-tuck', rank: 16, isLive: false, viewerCount: 64, genre: 'Rap', avatarEmoji: '🤙', accentColor: '#00FF88', sponsorCount: 2, country: '🇨🇦' },
    { id: 'p17', name: 'Diana Electro', slug: 'diana-electro', rank: 17, isLive: true, viewerCount: 52, genre: 'EDM', avatarEmoji: '💙', accentColor: '#00C8FF', sponsorCount: 1, country: '🇧🇷', liveStartedAt: new Date(now - 55 * 60000).toISOString() },
    { id: 'p18', name: 'Bobby Stanley', slug: 'bobby-stanley', rank: 18, isLive: false, viewerCount: 41, genre: 'Host', avatarEmoji: '🎙️', accentColor: '#FFB800', sponsorCount: 3, country: '🇺🇸' },
  ];
}

export default function BillboardLiveWall({ mode = 'home', maxTiles = 12, showActions = false, forceShape, title, className = '' }: BillboardLiveWallProps) {
  const [performers, setPerformers] = useState<PerformerSlot[]>([]);
  const [justJoinedIdx, setJustJoinedIdx] = useState<number | null>(null);
  const [sponsorIdx, setSponsorIdx] = useState<number>(0);

  useEffect(() => {
    const seed = [...seedPerformers()]
      .sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return (a.rank ?? 99) - (b.rank ?? 99);
      })
      .slice(0, maxTiles);
    setPerformers(seed);

    async function fetchLive() {
      try {
        const res = await fetch('/api/live', { cache: 'no-store' });
        if (!res.ok) return;
        const data: LiveFeedItem[] = await res.json();
        const liveIds = new Set(data.map((d) => d.id));
        const liveSlots: PerformerSlot[] = data.map((item) => ({
          id: item.id,
          name: item.performerName,
          slug: item.performerId,
          rank: item.battleRank,
          isLive: item.isLive,
          viewerCount: item.viewers,
          genre: item.genre,
          accentColor: item.accentColor,
          avatarUrl: item.thumbnailUrl,
          country: (item as any).country,
          liveStartedAt: (item as any).startedAt,
          motionAssetUrl: (item as any).motionAssetUrl,
        }));
        const seedFill = seed.filter((s) => !liveIds.has(s.id));
        setPerformers([...liveSlots, ...seedFill].slice(0, maxTiles));
      } catch { /* keep seed data on error */ }
    }

    fetchLive();
    const interval = setInterval(fetchLive, 4_000);
    return () => clearInterval(interval);
  }, [maxTiles]);

  useEffect(() => {
    const id = setInterval(() => {
      setJustJoinedIdx(Math.floor(Math.random() * performers.length));
      setTimeout(() => setJustJoinedIdx(null), 2800);
    }, 9000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [performers.length]);

  // Dynamic Sponsor Rotation Interval
  useEffect(() => {
    const sponsorTimer = setInterval(() => {
      setSponsorIdx((prev) => (prev + 1) % SPONSOR_ASSETS.length);
    }, 8000); // Rotates every 8 seconds
    return () => clearInterval(sponsorTimer);
  }, []);

  const shapes = MODE_SHAPES[mode];
  const getShape = useCallback((i: number): TileShape => forceShape ?? shapes[i % shapes.length]!, [forceShape, shapes]);
  const getFeaturedSize = (i: number) => {
    if (mode === 'home' && i === 0) return 240;
    if (mode === 'battle' && i < 2) return 220; // 1v1 battle focus
    if (mode === 'venue' && i === 0) return 280; // massive main stage
    return 170;
  };

  if (performers.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading performers…</div>;
  }

  return (
    <div className={className} style={{ width: '100%' }}>
      {/* Promotional Sign-up Ticker */}
      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', background: 'linear-gradient(90deg, #FFD700, #FF6B35, #FF2DAA)', color: '#050510', padding: '8px 0', marginBottom: '20px', borderRadius: '6px', fontWeight: 900, fontSize: '11px', letterSpacing: '0.15em', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)' }}>
        <div style={{ display: 'inline-block', animation: 'tmiTicker 40s linear infinite', paddingLeft: '100%' }}>
          {TICKER_MESSAGES.join('   ✦   ')}   ✦   {TICKER_MESSAGES.join('   ✦   ')}
        </div>
      </div>

      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 18, background: 'linear-gradient(180deg, #FFD700, #FF2DAA)', borderRadius: 2, boxShadow: '0 0 8px #FFD700' }} />
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>{title}</span>
            <span style={{ fontSize: 8, fontWeight: 900, color: '#FF2020', background: 'rgba(255,32,32,0.12)', border: '1px solid rgba(255,32,32,0.3)', borderRadius: 4, padding: '2px 8px', letterSpacing: '0.1em' }}>● LIVE</span>
          </div>
          <Link href="/live/rooms" style={{ fontSize: 9, fontWeight: 700, color: '#00FFFF', letterSpacing: '0.08em', textDecoration: 'none' }}>VIEW ALL →</Link>
        </div>
      )}

      {/* Dynamic Sponsor Rotation Block */}
      <div style={{
        width: '100%', height: 110, marginBottom: 20, borderRadius: 8, overflow: 'hidden', position: 'relative',
        border: '1px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
      }}>
        <img
          src={SPONSOR_ASSETS[sponsorIdx]}
          alt="Featured Sponsor"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: 'opacity 0.6s ease-in-out' }}
        />
        <div style={{
          position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.85)', padding: '4px 10px',
          borderRadius: 4, color: '#FFD700', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', border: '1px solid #FFD700'
        }}>
          FEATURED PARTNER
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'flex-start' }}>
        {performers.map((p, i) => {
          const isFlashing = justJoinedIdx === i;
          return (
            <div key={p.id} style={{ position: 'relative' }}>
              {isFlashing && (
                <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', background: '#00FF88', borderRadius: 6, padding: '2px 8px', fontSize: 8, fontWeight: 900, color: '#050510', letterSpacing: '0.1em', whiteSpace: 'nowrap', zIndex: 30, boxShadow: '0 0 10px #00FF88', animation: 'tmiJoinPop 0.3s cubic-bezier(0.7,0,0.3,1)' }}>
                  🎤 JUST JOINED
                </div>
              )}
              <MaskedVideoTile
                shape={getShape(i)}
                streamUrl={resolveMediaAsset(p)}
                performerName={p.name}
                performerSlug={p.slug}
                rank={p.rank}
                isLive={p.isLive}
                viewerCount={p.viewerCount}
                genre={p.genre}
                accentColor={p.accentColor ?? ACCENT_PALETTE[i % ACCENT_PALETTE.length]}
                size={getFeaturedSize(i)}
                avatarEmoji={p.avatarEmoji}
                avatarUrl={p.avatarUrl}
                showActions={showActions}
                onJoin={showActions ? () => { window.location.href = `/live/rooms/${p.id}?from=billboard-wall`; } : undefined}
                onTip={showActions ? () => alert(`Tip ${p.name}`) : undefined}
                onMessage={showActions ? () => alert(`Message ${p.name}`) : undefined}
              />
              <div style={{
                position: 'absolute',
                bottom: mode === 'performer-hub' ? 36 : 14,
                left: 10,
                right: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 20,
                pointerEvents: 'none'
              }}>
                {(p.country || p.countryName) && (
                  <span
                    title={p.countryName || 'Country'}
                    style={{ fontSize: 16, filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
                  >
                    {p.country ?? '🌍'}
                  </span>
                )}
                
                {p.isLive && p.liveStartedAt && (
                  <span style={{
                    fontSize: 9, fontWeight: 900, background: 'rgba(0, 0, 0, 0.75)',
                    padding: '3px 6px', borderRadius: 4, color: '#fff', backdropFilter: 'blur(4px)',
                    border: `1px solid ${p.accentColor}40`, boxShadow: `0 2px 8px rgba(0,0,0,0.5)`
                  }}>
                    {Math.floor((Date.now() - new Date(p.liveStartedAt).getTime()) / 60000)}m
                  </span>
                )}
              </div>
              {mode === 'home' && (
                <div style={{
                  position: 'absolute', top: 10, right: 10, zIndex: 25,
                  display: 'flex', alignItems: 'center', gap: 3,
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,215,0,0.4)', borderRadius: 20,
                  padding: '3px 8px', fontSize: 8, fontWeight: 900,
                  color: (p.sponsorCount ?? 0) > 0 ? '#FFD700' : 'rgba(255,255,255,0.7)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}>
                  {(p.sponsorCount ?? 0) > 0 ? `🤝 ${p.sponsorCount}` : '🤝 0'}
                </div>
              )}
              {!!p.sponsorCount && p.sponsorCount > 0 && (
                <div style={{
                  position: 'absolute', top: 10, right: 10, zIndex: 25,
                  display: 'flex', alignItems: 'center', gap: 3,
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,215,0,0.4)', borderRadius: 20,
                  padding: '3px 8px', fontSize: 8, fontWeight: 900, color: '#FFD700',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}>
                  🤝 {p.sponsorCount}
                </div>
              )}
              {mode === 'performer-hub' && p.sponsorCount !== undefined && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 8 }}>
                  {p.sponsorCount > 0 ? (
                    <>
                      <span style={{ color: '#FFD700' }}>🤝</span>
                      <span style={{ color: '#FFD700', fontWeight: 700 }}>{p.sponsorCount} sponsors</span>
                      <Link href={`/hub/sponsor?target=performer&slug=${p.slug}`} style={{ color: '#00FFFF', fontWeight: 700, textDecoration: 'none', fontSize: 8 }}>Sponsor →</Link>
                    </>
                  ) : (
                    <Link href={`/hub/sponsor?target=performer&slug=${p.slug}`} style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, textDecoration: 'none', fontSize: 8 }}>+ Be First Sponsor</Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <Link href="/live/rooms" style={{ padding: '8px 20px', background: 'linear-gradient(90deg, #00FFFF, #00C8FF)', borderRadius: 8, fontSize: 9, fontWeight: 900, color: '#050510', textDecoration: 'none', letterSpacing: '0.1em', boxShadow: '0 0 14px rgba(0,255,255,0.35)' }}>
          JOIN LOBBY →
        </Link>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{performers.filter((p) => p.isLive).length} performers live now</span>
      </div>

      <style>{`
        @keyframes tmiJoinPop { 0% { transform: translateX(-50%) scale(0.6); opacity: 0; } 100% { transform: translateX(-50%) scale(1); opacity: 1; } }
        @keyframes tmiTicker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}
