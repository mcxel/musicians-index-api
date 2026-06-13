'use client';

import React from 'react';

export const MAG_COLORS = {
  OR: '#FF6B00',
  GD: '#FFD700',
  CY: '#00D4FF',
  PK: '#FF2DAA',
  TL: '#00A896',
  PU: '#6B2FB3',
  DT: '#1A4A6A',
  NV: '#0D1B2A',
  RD: '#CC2200',
  MG: '#8B1A8B',
};

const SHP: Record<string, string> = {
  hex: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  pent: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  tagR: 'polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%)',
  tagL: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)',
  blob: 'polygon(3% 0%, 97% 2%, 100% 97%, 0% 100%)',
  slash: 'polygon(0% 0%, 90% 0%, 100% 100%, 10% 100%)',
  shield: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  oct: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  jagg: 'polygon(0% 5%, 93% 0%, 100% 94%, 7% 100%)',
};

export function ConfettiBackground({ count = 22 }: { count?: number }) {
  const colors = [MAG_COLORS.OR, MAG_COLORS.GD, MAG_COLORS.CY, MAG_COLORS.PK, MAG_COLORS.TL, '#FF8C00', '#00FF88'];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {Array.from({ length: count }).map((_, i) => {
        const c = colors[i % colors.length];
        const x = (i * 13 + 7) % 98;
        const y = (i * 17 + 11) % 94;
        const s = 5 + (i % 4) * 3;
        const r = i * 37;
        return (
          <div key={i} style={{
            position: 'absolute', left: `${x}%`, top: `${y}%`, width: s, height: s,
            background: c, opacity: 0.5, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            transform: `rotate(${r}deg)`
          }} />
        );
      })}
    </div>
  );
}

export function GeoBlock({ bg, border, shape, width = '100%', height, label, children, style }: { bg: string, border: string, shape: string, width?: string | number, height: number, label: string, children?: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <div style={{
      background: bg, border: `2px solid ${border}`, clipPath: SHP[shape] || 'none',
      width, height, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '10px 14px', position: 'relative', overflow: 'hidden',
      boxSizing: 'border-box', ...style
    }}>
      <div style={{ fontSize: 7, fontWeight: 900, color: border, letterSpacing: '.15em', fontFamily: 'Inter, sans-serif', opacity: 0.6, textTransform: 'uppercase', position: 'absolute', top: 6, left: 10 }}>{label}</div>
      {children}
    </div>
  );
}

export function MagButton({ label, bg, color = '#fff', border }: { label: string, bg: string, color?: string, border?: string }) {
  return (
    <div style={{ background: bg, color, padding: '6px 18px', borderRadius: 20, fontSize: 9, fontWeight: 900, fontFamily: 'Inter, sans-serif', letterSpacing: '.08em', cursor: 'pointer', border: `2px solid ${border || bg}`, display: 'inline-block', boxShadow: `0 0 10px ${bg}66`, textAlign: 'center' }}>{label}</div>
  );
}

export function MagPill({ text, bg, color = '#fff' }: { text: string, bg: string, color?: string }) {
  return (
    <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 12, fontSize: 8, fontWeight: 900, fontFamily: 'Inter, sans-serif', letterSpacing: '.08em', display: 'inline-block' }}>{text}</span>
  );
}

export function NeonHead({ text, color, size = 22 }: { text: string, color: string, size?: number }) {
  return (
    <div style={{ fontSize: size, fontWeight: 900, fontFamily: 'Impact, "Arial Black", sans-serif', color, letterSpacing: '.03em', textShadow: `0 0 14px ${color}88`, lineHeight: 1.05 }}>{text}</div>
  );
}