'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';

// Deterministic particle positions — no Math.random() on render (avoids hydration mismatch)
const PARTICLES = [
  { x: 8,  y: 12, size: 6,  opacity: 0.18, delay: 0,   dur: 14 },
  { x: 22, y: 78, size: 4,  opacity: 0.12, delay: 2.5, dur: 18 },
  { x: 45, y: 22, size: 8,  opacity: 0.10, delay: 1,   dur: 22 },
  { x: 67, y: 55, size: 5,  opacity: 0.15, delay: 4,   dur: 16 },
  { x: 80, y: 10, size: 7,  opacity: 0.09, delay: 1.5, dur: 20 },
  { x: 90, y: 70, size: 4,  opacity: 0.14, delay: 3,   dur: 17 },
  { x: 12, y: 88, size: 9,  opacity: 0.08, delay: 5,   dur: 25 },
  { x: 55, y: 90, size: 5,  opacity: 0.11, delay: 0.5, dur: 19 },
  { x: 35, y: 45, size: 3,  opacity: 0.16, delay: 2,   dur: 13 },
  { x: 75, y: 35, size: 6,  opacity: 0.10, delay: 3.5, dur: 21 },
];

interface EditorialCanvasShellProps {
  children: ReactNode;
  displayName: string;
  accentColor?: string;
  isLive?: boolean;
  backHref?: string;
  backLabel?: string;
  rankBadge?: string;
}

export default function EditorialCanvasShell({
  children,
  displayName,
  accentColor = '#FF2DAA',
  isLive = false,
  backHref = '/performers',
  backLabel = '← Performers',
  rankBadge,
}: EditorialCanvasShellProps) {
  const CYAN    = '#00FFFF';
  const FUCHSIA = '#FF2DAA';
  const accent  = accentColor;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#05060c', color: '#e4e4f0', fontFamily: "'Inter', 'DM Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ── LAYER 1: Deep-space base gradient ── */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 30% 20%, #0d0720 0%, #05060c 60%, #020208 100%)', zIndex: 0, pointerEvents: 'none' }} />

      {/* ── LAYER 2: Large glow blobs ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%',  width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`, filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '50%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${CYAN}08 0%, transparent 70%)`,   filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '40%', width: 350, height: 350, borderRadius: '50%', background: `radial-gradient(circle, #4a2080 0.08%, transparent 70%)`, filter: 'blur(90px)' }} />
      </div>

      {/* ── LAYER 3: Floating geometric particles ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}>
        <style>{`
          @keyframes float-a { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(15deg); } }
          @keyframes float-b { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(16px) rotate(-10deg); } }
          @keyframes pulse-live { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top:  `${p.y}%`,
              width:  p.size,
              height: p.size,
              background: i % 3 === 0 ? accent : i % 3 === 1 ? CYAN : FUCHSIA,
              opacity: p.opacity,
              borderRadius: i % 2 === 0 ? '50%' : 2,
              animation: `${i % 2 === 0 ? 'float-a' : 'float-b'} ${p.dur}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── LAYER 4: Sticky nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,6,12,0.90)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
      }}>
        <Link href={backHref} style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', textTransform: 'uppercase' }}>
          {backLabel}
        </Link>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '-0.01em', color: '#fff', textTransform: 'uppercase' }}>{displayName}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {isLive && (
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: FUCHSIA, background: `${FUCHSIA}18`, border: `1px solid ${FUCHSIA}50`, borderRadius: 4, padding: '2px 8px', textTransform: 'uppercase', animation: 'pulse-live 1.5s ease-in-out infinite' }}>
              ● LIVE
            </span>
          )}
          {rankBadge && (
            <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.16em', color: accent, border: `1px solid ${accent}35`, borderRadius: 4, padding: '2px 8px', background: `${accent}0c`, textTransform: 'uppercase' }}>
              {rankBadge}
            </span>
          )}
        </div>
      </nav>

      {/* ── LAYERS 5–7: Main content ── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
