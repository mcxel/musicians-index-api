'use client';
import React from 'react';

export type TmiBadgeVariant =
  | 'LIVE'
  | 'HOT'
  | 'NEW'
  | 'TRENDING'
  | 'FEATURED'
  | 'TOP 10'
  | 'PREMIERE'
  | 'SPONSORED';

interface TmiBadgeOverlayProps {
  badge: TmiBadgeVariant;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'sm' | 'md';
}

const BADGE_STYLES: Record<TmiBadgeVariant, { bg: string; color: string; pulse?: boolean }> = {
  'LIVE': { bg: '#FF0040', color: '#fff', pulse: true },
  'HOT': { bg: '#FF6600', color: '#fff' },
  'NEW': { bg: '#00FF88', color: '#050510' },
  'TRENDING': { bg: '#FFD700', color: '#050510' },
  'FEATURED': { bg: '#00FFFF', color: '#050510' },
  'TOP 10': { bg: '#AA2DFF', color: '#fff' },
  'PREMIERE': { bg: '#FF2DAA', color: '#fff' },
  'SPONSORED': { bg: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' },
};

const POSITIONS = {
  'top-left': { top: 8, left: 8 },
  'top-right': { top: 8, right: 8 },
  'bottom-left': { bottom: 8, left: 8 },
  'bottom-right': { bottom: 8, right: 8 },
};

export default function TmiBadgeOverlay({
  badge,
  position = 'top-left',
  size = 'sm',
}: TmiBadgeOverlayProps) {
  const style = BADGE_STYLES[badge];
  const pos = POSITIONS[position];

  return (
    <div
      style={{
        position: 'absolute',
        ...pos,
        background: style.bg,
        color: style.color,
        fontSize: size === 'sm' ? 7 : 9,
        fontWeight: 800,
        letterSpacing: '0.1em',
        padding: size === 'sm' ? '2px 7px' : '4px 10px',
        borderRadius: 3,
        zIndex: 10,
        animation: style.pulse ? 'tmi-badge-pulse 1.2s ease-in-out infinite' : undefined,
        whiteSpace: 'nowrap',
      }}
    >
      {badge === 'LIVE' && (
        <span
          style={{
            display: 'inline-block',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#fff',
            marginRight: 4,
            verticalAlign: 'middle',
          }}
        />
      )}
      {badge}
      <style>{`
        @keyframes tmi-badge-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #FF004066; }
          50% { opacity: 0.7; box-shadow: 0 0 12px #FF004099; }
        }
      `}</style>
    </div>
  );
}
