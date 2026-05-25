'use client';

import type { CSSProperties, ReactNode } from 'react';

export type GeoShape =
  | 'hex' | 'pent' | 'tagR' | 'tagL' | 'blob'
  | 'slash' | 'shield' | 'oct' | 'jagg' | 'rect' | 'diamond';

export const GEO_SHAPES: Record<GeoShape, string | undefined> = {
  hex:     'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  pent:    'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  tagR:    'polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%)',
  tagL:    'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)',
  blob:    'polygon(3% 0%, 97% 2%, 100% 97%, 0% 100%)',
  slash:   'polygon(0% 0%, 90% 0%, 100% 100%, 10% 100%)',
  shield:  'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  oct:     'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  jagg:    'polygon(0% 5%, 93% 0%, 100% 94%, 7% 100%)',
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  rect:    undefined,
};

// Scattered confetti triangles — one shared component for all pages
export function TMIConfetti({ count = 24 }: { count?: number }) {
  const colors = ['#FF6B00', '#FFD700', '#00D4FF', '#FF2DAA', '#00A896', '#AA2DFF'];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {Array.from({ length: count }).map((_, i) => {
        const color = colors[i % colors.length]!;
        const left = `${(i * 37 + 11) % 97}%`;
        const top  = `${(i * 53 + 7)  % 94}%`;
        const size = 8 + (i % 5) * 4;
        const rot  = (i * 67) % 360;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left, top,
              width: size, height: size,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              background: color,
              opacity: 0.45,
              transform: `rotate(${rot}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

// Magazine overlay stack — paper + halftone + grain + gloss
export function TMIMagazineOverlay() {
  return (
    <>
      {/* Paper underlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: '#1a0a2e',
        backgroundImage: "radial-gradient(circle, rgba(255,200,120,0.04) 1px, transparent 1px)",
        backgroundSize: '8px 8px',
        mixBlendMode: 'multiply', opacity: 0.5,
      }} />
      {/* Halftone dots */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: [
          'radial-gradient(circle, rgba(0,200,255,0.09) 1.2px, transparent 1.2px)',
          'radial-gradient(circle, rgba(255,45,170,0.06) 0.9px, transparent 0.9px)',
        ].join(', '),
        backgroundSize: '7px 7px, 5px 5px',
        backgroundPosition: '0 0, 2.5px 2.5px',
      }} />
      {/* Grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 90, pointerEvents: 'none',
        backgroundImage: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.5'/></svg>\")",
        mixBlendMode: 'multiply', opacity: 0.22,
      }} />
    </>
  );
}

// Chromatic headline — CMYK offset effect
export function TMIHeadline({
  children,
  size = 'lg',
  color = '#FFD700',
  align = 'left',
  style,
}: {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: CSSProperties;
}) {
  const fontSize = { sm: 'clamp(18px,3vw,26px)', md: 'clamp(26px,4vw,38px)', lg: 'clamp(34px,5.5vw,58px)', xl: 'clamp(48px,7vw,88px)' }[size];
  return (
    <div style={{ position: 'relative', textAlign: align, ...style }}>
      <div style={{ position: 'absolute', top: 2, left: 2, fontSize, fontFamily: "'Bebas Neue','Impact',sans-serif", color: '#00C8FF', opacity: 0.55, letterSpacing: '0.02em', pointerEvents: 'none', userSelect: 'none' }}>{children}</div>
      <div style={{ position: 'absolute', top: -1, left: -1, fontSize, fontFamily: "'Bebas Neue','Impact',sans-serif", color: '#FF2DAA', opacity: 0.45, letterSpacing: '0.02em', pointerEvents: 'none', userSelect: 'none' }}>{children}</div>
      <div style={{ position: 'relative', fontSize, fontFamily: "'Bebas Neue','Impact',sans-serif", color, letterSpacing: '0.02em' }}>{children}</div>
    </div>
  );
}

// Neon pill badge
export function TMIPill({
  label,
  color = '#00C8FF',
  icon,
  onClick,
  active,
}: {
  label: string;
  color?: string;
  icon?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? color : `${color}18`,
        border: `1px solid ${color}66`,
        color: active ? '#050510' : color,
        fontFamily: "'Inter',sans-serif",
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '5px 12px',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: active ? `0 0 12px ${color}66` : undefined,
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <span style={{ marginRight: 5 }}>{icon}</span>}
      {label}
    </button>
  );
}

// LIVE badge
export function TMILiveBadge({ viewers }: { viewers?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#CC2200', boxShadow: '0 0 8px #CC2200', display: 'inline-block', animation: 'tmiBlink 1.1s step-end infinite' }} />
      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, color: '#CC2200', letterSpacing: '0.18em' }}>LIVE</span>
      {viewers != null && (
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
          {viewers >= 1000 ? `${(viewers / 1000).toFixed(1)}k` : viewers}
        </span>
      )}
    </div>
  );
}

// Main geometric block
export interface TMIGeoBlockProps {
  shape?: GeoShape;
  bg?: string;
  border?: string;
  label?: string;
  accentColor?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  glow?: boolean;
}

export default function TMIGeoBlock({
  shape = 'rect',
  bg = 'rgba(8,10,20,0.92)',
  border,
  label,
  accentColor = '#00C8FF',
  children,
  className,
  style,
  onClick,
  glow = false,
}: TMIGeoBlockProps) {
  const clipPath = GEO_SHAPES[shape];
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        position: 'relative',
        background: bg,
        border: border ? `1.5px solid ${border}` : `1.5px solid ${accentColor}28`,
        clipPath,
        boxShadow: glow
          ? `0 0 24px ${accentColor}44, 0 12px 32px rgba(0,0,0,0.6), -1px -1px 0 rgba(6,6,12,0.95)`
          : `0 12px 28px rgba(0,0,0,0.5), -1px -1px 0 rgba(6,6,12,0.95)`,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'box-shadow 0.2s ease',
        overflow: clipPath ? 'hidden' : undefined,
        ...style,
      }}
    >
      {label && (
        <div style={{
          position: 'absolute', top: 8, left: 12, zIndex: 2,
          fontFamily: "'Inter', sans-serif", fontSize: 8, fontWeight: 900,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: accentColor, opacity: 0.85,
        }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
