import type { CSSProperties, ReactNode } from 'react';

type GlowAccent = 'cyan' | 'pink' | 'purple' | 'gold';

const BORDER_BY_ACCENT: Record<GlowAccent, string> = {
  cyan: 'rgba(0,255,255,0.32)',
  pink: 'rgba(255,45,170,0.34)',
  purple: 'rgba(170,45,255,0.34)',
  gold: 'rgba(255,215,0,0.34)',
};

const GLOW_BY_ACCENT: Record<GlowAccent, string> = {
  cyan: 'rgba(0,255,255,0.18)',
  pink: 'rgba(255,45,170,0.18)',
  purple: 'rgba(170,45,255,0.18)',
  gold: 'rgba(255,215,0,0.18)',
};

interface GlowFrameProps {
  children: ReactNode;
  accent?: GlowAccent;
  style?: CSSProperties;
}

export default function GlowFrame({ children, accent = 'cyan', style }: Readonly<GlowFrameProps>) {
  const borderColor = BORDER_BY_ACCENT[accent];
  const glowColor = GLOW_BY_ACCENT[accent];

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 10,
        border: `1px solid ${borderColor}`,
        background: 'linear-gradient(180deg, rgba(10,12,28,0.96) 0%, rgba(6,7,18,0.98) 100%)',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 36px ${glowColor}, inset 0 0 28px rgba(0,0,0,0.45)`,
        ...style,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${glowColor} 0%, transparent 30%, transparent 70%, ${glowColor} 100%)`,
          pointerEvents: 'none',
          opacity: 0.55,
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 16,
          height: 16,
          borderTop: `2px solid ${borderColor}`,
          borderLeft: `2px solid ${borderColor}`,
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 16,
          height: 16,
          borderTop: `2px solid ${borderColor}`,
          borderRight: `2px solid ${borderColor}`,
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 16,
          height: 16,
          borderBottom: `2px solid ${borderColor}`,
          borderLeft: `2px solid ${borderColor}`,
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 16,
          height: 16,
          borderBottom: `2px solid ${borderColor}`,
          borderRight: `2px solid ${borderColor}`,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}