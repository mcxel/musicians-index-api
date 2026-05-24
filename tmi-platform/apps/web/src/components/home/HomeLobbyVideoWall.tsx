'use client';

/**
 * HomeLobbyVideoWall — chaotic live lobby wall for the homepage.
 *
 * A wall of many TMIUniversalPlayer instances showing everyone in the lobby.
 * Varied sizes, slight rotations, different frame styles — intentionally chaotic.
 */

import Link from 'next/link';
import TMIUniversalPlayer from '@/components/media/TMIUniversalPlayer';
import type { FrameStyle, SizePreset } from '@/components/media/TMIUniversalPlayer';

interface LobbySlot {
  avatarEmoji: string;
  avatarName:  string;
  frameStyle:  FrameStyle;
  frameColor:  string;
  frameColor2: string;
  size:        SizePreset;
  title?:      string;
  rotate:      number;   // degrees
  viewers?:    number;
  scanLines?:  boolean;
  colSpan?:    number;
  rowSpan?:    number;
}

const LOBBY_SLOTS: LobbySlot[] = [
  {
    avatarEmoji: '🎤',  avatarName: 'Astra Nova',
    frameStyle: 'neon',         frameColor: '#FF2DAA', frameColor2: '#AA2DFF',
    size: 'card',   title: 'R&B Stage — Live',
    rotate: -2,     viewers: 847,   colSpan: 2,
  },
  {
    avatarEmoji: '🎧',  avatarName: 'Koda Rush',
    frameStyle: 'holographic',  frameColor: '#00FFFF', frameColor2: '#FF2DAA',
    size: 'mini',   title: 'Beat Lab',
    rotate: 3,      viewers: 312,
  },
  {
    avatarEmoji: '🕺',  avatarName: 'Fan #2841',
    frameStyle: 'glass',        frameColor: '#AA2DFF', frameColor2: '#00FFFF',
    size: 'mini',
    rotate: -1,     viewers: 0,
  },
  {
    avatarEmoji: '🎹',  avatarName: 'Velvet Sol',
    frameStyle: 'circuit',      frameColor: '#00FF88', frameColor2: '#00FFFF',
    size: 'portrait', title: 'Keys Session',
    rotate: 2,      viewers: 134,
  },
  {
    avatarEmoji: '🎸',  avatarName: 'Torque Sin',
    frameStyle: 'gold',         frameColor: '#FFD700', frameColor2: '#FF9500',
    size: 'mini',   title: 'Rock Arena',
    rotate: -3,     viewers: 219,
  },
  {
    avatarEmoji: '💃',  avatarName: 'Fan #7703',
    frameStyle: 'neon',         frameColor: '#FF2DAA', frameColor2: '#FFD700',
    size: 'mini',
    rotate: 1,      viewers: 0,
  },
  {
    avatarEmoji: '🎺',  avatarName: 'Ivory Arc',
    frameStyle: 'stage',        frameColor: '#4488FF', frameColor2: '#FFD700',
    size: 'card',   title: 'Jazz Lounge',
    rotate: -2,     viewers: 88,  colSpan: 2,
  },
  {
    avatarEmoji: '🎤',  avatarName: 'Lagos Burst',
    frameStyle: 'holographic',  frameColor: '#FF6B35', frameColor2: '#00C853',
    size: 'mini',   title: 'Afrobeat',
    rotate: 4,      viewers: 563,
  },
  {
    avatarEmoji: '🎛️',  avatarName: 'Prism Vex',
    frameStyle: 'circuit',      frameColor: '#FF2DAA', frameColor2: '#00FFFF',
    size: 'mini',   title: 'EDM Drop',
    rotate: -2,     viewers: 701,
  },
  {
    avatarEmoji: '🎵',  avatarName: 'Fan #1190',
    frameStyle: 'glass',        frameColor: '#00FFFF', frameColor2: '#AA2DFF',
    size: 'mini',
    rotate: 3,      viewers: 0,
  },
  {
    avatarEmoji: '👑',  avatarName: 'Zion Freq',
    frameStyle: 'gold',         frameColor: '#FFD700', frameColor2: '#FF9500',
    size: 'card',   title: 'Gospel Crown',
    rotate: -1,     viewers: 1204, colSpan: 2,
    scanLines: true,
  },
  {
    avatarEmoji: '🥊',  avatarName: 'Fan #4455',
    frameStyle: 'neon',         frameColor: '#00FF88', frameColor2: '#00FFFF',
    size: 'mini',   title: 'Battle Floor',
    rotate: 2,      viewers: 0,
  },
];

export default function HomeLobbyVideoWall({ accentColor = '#00FFFF' }: { accentColor?: string }) {
  return (
    <section style={{
      padding: '20px 12px 14px',
      position: 'relative',
      borderTop: `1px solid ${accentColor}22`,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 100%)',
      backdropFilter: 'blur(10px)',
      overflow: 'hidden',
    }}>
      {/* Scanline underlay */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)',
        backgroundSize: '100% 4px',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, position: 'relative', zIndex: 2 }}>
        {/* Pulsing live dot */}
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: '#FF2DAA',
          boxShadow: '0 0 8px #FF2DAA', display: 'inline-block',
          animation: 'tmiRingGlow 1.4s ease-in-out infinite',
        }} />
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.28em', color: '#FF2DAA' }}>
          LIVE NOW
        </span>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg,${accentColor}44,transparent)` }} />
        <Link href="/live/lobby" style={{
          fontSize: 7, fontWeight: 800, letterSpacing: '0.15em',
          color: accentColor, border: `1px solid ${accentColor}44`,
          padding: '2px 10px', borderRadius: 20, textDecoration: 'none',
        }}>
          JOIN LOBBY →
        </Link>
      </div>

      {/* Chaotic player grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 8,
        position: 'relative',
        zIndex: 2,
      }}>
        {LOBBY_SLOTS.map((slot, i) => (
          <div
            key={slot.avatarName + i}
            style={{
              gridColumn: slot.colSpan ? `span ${slot.colSpan}` : undefined,
              gridRow:    slot.rowSpan ? `span ${slot.rowSpan}` : undefined,
              transform:  `rotate(${slot.rotate}deg)`,
              transition: 'transform 0.3s ease',
            }}
          >
            <TMIUniversalPlayer
              mode="avatar"
              avatarEmoji={slot.avatarEmoji}
              avatarName={slot.avatarName}
              frameStyle={slot.frameStyle}
              frameColor={slot.frameColor}
              frameColor2={slot.frameColor2}
              size={slot.size}
              title={slot.title}
              subtitle={slot.viewers && slot.viewers > 0 ? `${slot.viewers.toLocaleString()} watching` : undefined}
              scanLines={slot.scanLines}
              showBadge
              controls={false}
              privacy="public"
              autoplay
              muted
            />
          </div>
        ))}
      </div>

      {/* Bottom CTA strip */}
      <div style={{
        marginTop: 12, textAlign: 'center', position: 'relative', zIndex: 2,
        display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap',
      }}>
        <Link href="/live/lobby" style={{
          padding: '7px 20px', fontSize: 9, fontWeight: 800, letterSpacing: '0.18em',
          background: `linear-gradient(135deg,#FF2DAA,#AA2DFF)`, color: '#fff',
          borderRadius: 20, textDecoration: 'none',
        }}>
          🔴 SEE EVERYONE LIVE
        </Link>
        <Link href="/signup" style={{
          padding: '7px 20px', fontSize: 9, fontWeight: 800, letterSpacing: '0.18em',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.7)', borderRadius: 20, textDecoration: 'none',
        }}>
          ADD YOUR VIDEO →
        </Link>
      </div>
    </section>
  );
}
