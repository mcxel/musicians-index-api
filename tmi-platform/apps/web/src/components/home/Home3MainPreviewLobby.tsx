'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import TMIUniversalPlayer from '@/components/media/TMIUniversalPlayer';

interface FeatureSlot {
  avatarEmoji: string;
  name: string;
  genre: string;
  viewers: number;
  frameColor: string;
  frameColor2: string;
  isLive?: boolean;
  performerSlug?: string;
}

const FEATURED: FeatureSlot[] = [
  { avatarEmoji: '🎤', name: 'Astra Nova', genre: 'R&B / Soul', viewers: 847, frameColor: '#FF2DAA', frameColor2: '#AA2DFF', isLive: true, performerSlug: 'astra-nova' },
  { avatarEmoji: '🥊', name: 'Battle Arc', genre: 'Cypher — Live', viewers: 1204, frameColor: '#FFD700', frameColor2: '#FF6B35', isLive: true, performerSlug: 'battle-arc' },
  { avatarEmoji: '🎧', name: 'Prism Vex', genre: 'EDM / Electronic', viewers: 701, frameColor: '#00FFFF', frameColor2: '#AA2DFF', isLive: true, performerSlug: 'prism-vex' },
  { avatarEmoji: '🌍', name: 'Lagos Burst', genre: 'Afrobeats', viewers: 563, frameColor: '#00C853', frameColor2: '#FF6B35', isLive: true, performerSlug: 'lagos-burst' },
];

interface LobbyTile {
  avatarEmoji: string;
  name: string;
  label: string;
  color: string;
  viewers: number;
  intervalMs: number;
  startDelay: number;
}

const LOBBY_TILES: LobbyTile[] = [
  { avatarEmoji: '🎹', name: 'Velvet Sol',  label: 'Keys',      color: '#00FF88', viewers: 134, intervalMs: 9500,  startDelay: 0    },
  { avatarEmoji: '🎸', name: 'Torque Sin',  label: 'Rock',      color: '#FFD700', viewers: 219, intervalMs: 11300, startDelay: 1200 },
  { avatarEmoji: '🎺', name: 'Ivory Arc',   label: 'Jazz',      color: '#4488FF', viewers: 88,  intervalMs: 13100, startDelay: 2400 },
  { avatarEmoji: '💫', name: 'Neon Psalms', label: 'Soul',      color: '#00FF88', viewers: 204, intervalMs: 15200, startDelay: 600  },
  { avatarEmoji: '🎶', name: 'Wave Echo',   label: 'Late Night',color: '#AA2DFF', viewers: 67,  intervalMs: 17000, startDelay: 1800 },
  { avatarEmoji: '🔥', name: 'Cipher Bot',  label: 'Freestyle', color: '#FF6B35', viewers: 93,  intervalMs: 10700, startDelay: 900  },
  { avatarEmoji: '🌐', name: 'Global Arc',  label: 'World',     color: '#00FFFF', viewers: 155, intervalMs: 12500, startDelay: 2100 },
  { avatarEmoji: '⚡', name: 'Grid Walk',   label: 'Cypher',    color: '#FFD700', viewers: 78,  intervalMs: 14100, startDelay: 300  },
];

function RotatingLobbyTile({ tile, idx }: { tile: LobbyTile; idx: number }) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    const delay = setTimeout(() => {
      id = setInterval(() => setActive(v => !v), tile.intervalMs / 2);
    }, tile.startDelay);
    return () => { clearTimeout(delay); clearInterval(id); };
  }, [tile.intervalMs, tile.startDelay]);

  const displayName = active ? tile.name : LOBBY_TILES[(idx + 4) % LOBBY_TILES.length]!.name;
  const displayEmoji = active ? tile.avatarEmoji : LOBBY_TILES[(idx + 4) % LOBBY_TILES.length]!.avatarEmoji;
  const displayColor = active ? tile.color : LOBBY_TILES[(idx + 4) % LOBBY_TILES.length]!.color;

  return (
    <Link
      href={`/rooms/${tile.name.toLowerCase().replace(/\s+/g, '-')}?autoSeat=1`}
      style={{ textDecoration: 'none' }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${displayColor}18, rgba(0,0,0,0.6))`,
        border: `1px solid ${displayColor}44`,
        borderRadius: 10,
        padding: '10px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        cursor: 'pointer',
        transition: 'transform 0.25s ease, border-color 0.4s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span style={{ fontSize: 22 }}>{displayEmoji}</span>
        <span style={{ fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.2 }}>{displayName}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF2020', display: 'inline-block' }} />
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.55)' }}>{tile.viewers} live</span>
        </div>
        <span style={{ fontSize: 7, color: displayColor, fontWeight: 800, letterSpacing: '0.1em' }}>{tile.label}</span>
      </div>
    </Link>
  );
}

export default function Home3MainPreviewLobby({ title = 'MAIN PREVIEW LOBBY' }: { title?: string }) {
  const [featIdx, setFeatIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFeatIdx(prev => (prev + 1) % FEATURED.length), 8700);
    return () => clearInterval(id);
  }, []);

  const featured = FEATURED[featIdx]!;

  return (
    <div style={{ padding: '0 12px 8px' }}>
      <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 800, marginBottom: 14 }}>
        {title}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr minmax(180px, 260px)',
        gap: 16,
        alignItems: 'start',
      }}>
        {/* LEFT — Featured performer (big) */}
        <motion.div
          key={featIdx}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          style={{
            position: 'relative',
            borderRadius: 14,
            overflow: 'hidden',
            border: `2px solid ${featured.frameColor}55`,
            boxShadow: `0 0 40px ${featured.frameColor}33, inset 0 0 0 1px ${featured.frameColor}22`,
            background: `linear-gradient(135deg, ${featured.frameColor}18, #050510)`,
            minHeight: 320,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}
        >
          {/* Avatar / video area */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px 0' }}>
            <TMIUniversalPlayer
              mode="avatar"
              avatarEmoji={featured.avatarEmoji}
              avatarName={featured.name}
              frameStyle="neon"
              frameColor={featured.frameColor}
              frameColor2={featured.frameColor2}
              size="theater"
              title={featured.genre}
              showBadge
              controls={false}
              privacy="public"
              autoplay
              muted
            />
          </div>

          {/* LIVE badge */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,32,32,0.9)', backdropFilter: 'blur(6px)',
            borderRadius: 20, padding: '4px 10px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'tmiLivePulse 1s ease-in-out infinite alternate' }} />
            <span style={{ fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: '0.12em' }}>LIVE</span>
          </div>

          {/* Viewer count badge */}
          <div style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            borderRadius: 8, padding: '4px 8px',
          }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
              👁 {featured.viewers.toLocaleString()}
            </span>
          </div>

          {/* Bottom info bar */}
          <div style={{
            padding: '14px 16px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4, letterSpacing: '0.04em' }}>
              {featured.name}
            </div>
            <div style={{ fontSize: 9, color: featured.frameColor, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 10 }}>
              {featured.genre}
            </div>
            <Link
              href={`/rooms/${featured.performerSlug ?? ''}?autoSeat=1`}
              style={{
                display: 'inline-block', padding: '8px 20px',
                background: featured.frameColor, color: '#000',
                borderRadius: 6, fontSize: 9, fontWeight: 900,
                letterSpacing: '0.12em', textDecoration: 'none',
                boxShadow: `0 0 16px ${featured.frameColor}88`,
              }}
            >
              ▶ JOIN ROOM
            </Link>
          </div>

          {/* Slide indicator dots */}
          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            display: 'flex', gap: 5,
          }}>
            {FEATURED.map((_, i) => (
              <div key={i} style={{
                width: i === featIdx ? 16 : 6, height: 6,
                borderRadius: 3,
                background: i === featIdx ? featured.frameColor : 'rgba(255,255,255,0.2)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }} />
            ))}
          </div>
        </motion.div>

        {/* RIGHT — Lobby wall (8 independent tiles, 2×4 grid) */}
        <div>
          <div style={{ fontSize: 7, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 8 }}>
            LOBBY WALL
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 7,
          }}>
            {LOBBY_TILES.map((tile, i) => (
              <RotatingLobbyTile key={i} tile={tile} idx={i} />
            ))}
          </div>
          <Link href="/live/rooms" style={{
            display: 'block', marginTop: 10, textAlign: 'center',
            padding: '7px 0', borderRadius: 6,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            fontSize: 8, fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.6)',
            textDecoration: 'none',
          }}>
            SEE ALL ROOMS →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes tmiLivePulse { from { opacity: 1; } to { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
