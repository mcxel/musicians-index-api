'use client';

import { useEffect, useState } from 'react';

interface HeroLightningAtmosphereProps {
  children: React.ReactNode;
}

/**
 * Event-Driven Photorealistic Lightning & Atmosphere Engine
 *
 * Performance-optimized & battery-conscious:
 * 1. Uses a subtle static/idle ambient gradient & lightweight SVG paths by default.
 * 2. Activates photorealistic video strike FX ONLY on short event-driven triggers.
 * 3. Respects `@media (prefers-reduced-motion: reduce)` to disable high-contrast flash animations.
 * 4. Gracefully degrades to poster gradients when video autoplay fails or media load fails.
 */
export default function HeroLightningAtmosphere({ children }: HeroLightningAtmosphereProps) {
  const [strikeActive, setStrikeActive] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Event-driven strike trigger (e.g. on battle rotation or periodic 12s pulse)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setStrikeActive(true);
      setTimeout(() => setStrikeActive(false), 1200); // Short burst only
    }, 12000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      {/* ── Reduced Motion and Keyframe Animations ── */}
      <style jsx global>{`
        @keyframes subtleHeroGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes heroStrikeBurst {
          0% { opacity: 0; transform: scale(1); }
          15% { opacity: 1; transform: scale(1.02); filter: brightness(1.8) drop-shadow(0 0 35px #00FFFF); }
          50% { opacity: 0.7; }
          100% { opacity: 0; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-lightning-video, .hero-strike-overlay, .hero-spark-particle {
            display: none !important;
            animation: none !important;
          }
        }
      `}</style>

      {/* ── Layer 0: Idle Atmospheric Gradient Underlay (Low Resource) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 229, 255, 0.12) 0%, rgba(255, 45, 170, 0.08) 50%, rgba(3, 2, 12, 0.95) 100%)',
          animation: prefersReducedMotion ? 'none' : 'subtleHeroGlow 8s ease-in-out infinite',
        }}
      />

      {/* ── Layer 1: Event-Driven Photorealistic MP4 Video Strike (Activated during strike bursts) ── */}
      {strikeActive && !videoError && !prefersReducedMotion && (
        <div
          className="hero-lightning-video"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            overflow: 'hidden',
            mixBlendMode: 'screen',
            opacity: 0.75,
            transition: 'opacity 0.3s ease',
          }}
        >
          <video
            src="/banners/lightning/204835-925552445_medium Battle of the chapions lightning.mp4"
            autoPlay
            muted
            playsInline
            onError={() => setVideoError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              filter: 'hue-rotate(190deg) saturate(1.8)',
            }}
          />
        </div>
      )}

      {/* ── Layer 2: Lightweight SVG Lightning Arcs (Always present, subtle) ── */}
      {!prefersReducedMotion && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}>
          <svg
            viewBox="0 0 1200 500"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, opacity: strikeActive ? 0.85 : 0.25, transition: 'opacity 0.3s ease' }}
          >
            {/* Left Arc */}
            <path d="M 120 0 L 100 120 L 140 140 L 80 280 L 120 290 L 70 480" fill="none" stroke="#00FFFF" strokeWidth="3.5" filter="drop-shadow(0 0 10px #00FFFF)" />
            {/* Center Arc */}
            <path d="M 600 0 L 570 140 L 630 150 L 550 310 L 610 320 L 540 500" fill="none" stroke="#FFD700" strokeWidth="4" filter="drop-shadow(0 0 14px #FFD700)" />
            {/* Right Arc */}
            <path d="M 1080 0 L 1050 130 L 1100 140 L 1030 300 L 1070 310 L 1010 490" fill="none" stroke="#FF2DAA" strokeWidth="3.5" filter="drop-shadow(0 0 10px #FF2DAA)" />
          </svg>
        </div>
      )}

      {/* ── Layer 3: High-Voltage Strike Burst Overlay ── */}
      {strikeActive && !prefersReducedMotion && (
        <div
          className="hero-strike-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            pointerEvents: 'none',
            animation: 'heroStrikeBurst 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            background: 'radial-gradient(circle at 50% 20%, rgba(0,229,255,0.4) 0%, rgba(255,215,0,0.25) 45%, rgba(255,45,170,0.15) 75%, transparent 100%)',
          }}
        />
      )}

      {/* ── Foreground Content Grid (Left Banner, Title Column, Right Banner) ── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
