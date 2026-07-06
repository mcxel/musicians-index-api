"use client";

import {
  type BroadcastQueueItem,
  BROADCAST_TYPE_LABEL,
  isOnAir,
} from '@/lib/broadcast/BroadcastQueueRegistry';

// BroadcastCell — one "window" in the broadcast mosaic wall.
// Honest states only: on-air items (LIVE/BATTLE/CYPHER) pulse; WAITING/STARTING
// render a dim standby glow. Never a dead black tile, never a fake feed.
// Featured cells (on-air, 2×2 span in the mosaic) scale up typography.
export function BroadcastCell({
  item,
  onPreview,
  featured = false,
}: {
  item: BroadcastQueueItem;
  onPreview?: (id: string) => void;
  featured?: boolean;
}) {
  const onAir = isOnAir(item.state);
  const accent = item.accent;

  return (
    <a
      href={item.href}
      onMouseEnter={onPreview ? () => onPreview(item.id) : undefined}
      style={{
        textDecoration: 'none',
        position: 'relative',
        height: '100%',
        minHeight: 0,
        borderRadius: featured ? 6 : 4,
        border: `1.5px solid ${onAir ? accent : 'rgba(255,255,255,0.14)'}`,
        background: `radial-gradient(120% 120% at 15% 0%, ${accent}${onAir ? '30' : '14'}, rgba(6,8,20,0.96)), #08080f`,
        overflow: 'hidden',
        display: 'block',
      }}
    >
      {/* Pulsing standby / signal-locked backdrop — never a dead black tile */}
      <div
        style={{
          position: 'absolute',
          inset: '-15%',
          background: `conic-gradient(from 120deg, ${accent}30, rgba(10,20,40,0.1), ${accent}12, rgba(0,0,0,0.6))`,
          filter: 'blur(16px)',
          animation: onAir ? 'tmiCellLive 5s ease-in-out infinite' : 'tmiCellWaiting 4s ease-in-out infinite',
          opacity: onAir ? 1 : 0.55,
        }}
      />

      {/* State badge */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(0,0,0,0.6)',
          borderRadius: 4,
          padding: '2px 6px',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: onAir ? '#ff2d2d' : 'rgba(255,255,255,0.4)',
            boxShadow: onAir ? '0 0 8px #ff2d2daa' : 'none',
            animation: onAir ? 'tmiCellRecDot 1.2s infinite' : 'none',
          }}
        />
        <span style={{ fontSize: featured ? 10 : 8, fontWeight: 900, letterSpacing: '0.08em', color: onAir ? '#ff9b9b' : 'rgba(255,255,255,0.55)' }}>
          {item.state}
        </span>
      </div>

      {/* Genre / type chip */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          background: 'rgba(0,0,0,0.55)',
          borderRadius: 4,
          padding: '2px 6px',
          fontSize: featured ? 9 : 7,
          fontWeight: 800,
          letterSpacing: '0.06em',
          color: `${accent}dd`,
          textTransform: 'uppercase',
        }}
      >
        {BROADCAST_TYPE_LABEL[item.roomType]}
      </div>

      {/* Bottom info overlay */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.85), rgba(0,0,0,0))',
          padding: featured ? '26px 10px 8px' : '18px 7px 6px',
        }}
      >
        <div style={{ color: '#fff', fontWeight: 800, fontSize: featured ? 14 : 10, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </div>
        <div style={{ fontSize: featured ? 10 : 8, color: 'rgba(235,235,255,0.6)', marginTop: 1 }}>
          {item.genre || (onAir ? 'Live now' : 'Starting soon')}
        </div>
      </div>
    </a>
  );
}

export default BroadcastCell;
