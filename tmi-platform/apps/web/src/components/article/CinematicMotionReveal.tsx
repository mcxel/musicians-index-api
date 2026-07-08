'use client';

/**
 * CinematicMotionReveal — v1
 *
 * CSS-only cinematic entrance for performer article hero areas.
 * v1: slow zoom + light sweep + particle settle (no AI motion generation).
 * v2: MotionPoster upload/export pipeline.
 * v3: AI-assisted motion through provider adapters.
 *
 * Respects prefers-reduced-motion. Never fakes motion assets.
 */

import { useEffect, useState } from 'react';

export type MotionIntensity =
  | 'none'
  | 'subtle'
  | 'standard'
  | 'cinematic'
  | 'premium'
  | 'diamond';

interface Props {
  children: React.ReactNode;
  intensity?: MotionIntensity;
  accentColor?: string;
}

// Zoom duration per intensity level (seconds)
const ZOOM_DURATION: Record<MotionIntensity, string> = {
  none:      '0s',
  subtle:    '2s',
  standard:  '3.5s',
  cinematic: '5s',
  premium:   '5.5s',
  diamond:   '6s',
};

// Whether to show the light sweep (cinematic and above)
const SHOW_SWEEP: Record<MotionIntensity, boolean> = {
  none:      false,
  subtle:    false,
  standard:  true,
  cinematic: true,
  premium:   true,
  diamond:   true,
};

// Sweep delay so it starts after initial fade-in
const SWEEP_DELAY: Record<MotionIntensity, string> = {
  none:      '0s',
  subtle:    '0s',
  standard:  '0.5s',
  cinematic: '0.6s',
  premium:   '0.7s',
  diamond:   '0.8s',
};

export default function CinematicMotionReveal({
  children,
  intensity = 'standard',
  accentColor = '#00FFFF',
}: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1-frame delay so the CSS transition fires after first paint
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const dur        = ZOOM_DURATION[intensity];
  const showSweep  = SHOW_SWEEP[intensity];
  const sweepDelay = SWEEP_DELAY[intensity];

  // Diamond gets an extra edge-glow pulse
  const isDiamond  = intensity === 'diamond';
  const isPremium  = intensity === 'premium' || isDiamond;

  return (
    <div
      className={ready ? `tmi-reveal tmi-reveal--${intensity}` : 'tmi-reveal-init'}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {children}

      {/* Light sweep — standard through diamond */}
      {showSweep && ready && (
        <div
          aria-hidden
          className="tmi-reveal__sweep"
          style={{ animationDelay: sweepDelay }}
        />
      )}

      {/* Diamond edge glow — ambient lighting pulse around frame */}
      {isDiamond && ready && (
        <div aria-hidden className="tmi-reveal__diamond-edge" />
      )}

      {/* Particle shower — premium + diamond */}
      {isPremium && ready && (
        <div aria-hidden className="tmi-reveal__particles" />
      )}

      <style>{`
        /* ── Init state — invisible before first paint ── */
        .tmi-reveal-init { opacity: 0; }

        /* ── Base animated state ── */
        .tmi-reveal {
          animation-name: tmi-cinematic-zoom;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-fill-mode: forwards;
          animation-duration: ${dur};
        }

        /* None: just show immediately */
        .tmi-reveal--none {
          animation: none;
          opacity: 1;
        }

        @keyframes tmi-cinematic-zoom {
          0%   { opacity: 0; transform: scale(1.08); }
          10%  { opacity: 1; transform: scale(1.07); }
          65%  { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* ── Light sweep ── */
        .tmi-reveal__sweep {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 20;
          background: linear-gradient(
            108deg,
            transparent 20%,
            rgba(255,255,255,0.22) 45%,
            rgba(255,255,255,0.10) 52%,
            transparent 75%
          );
          animation: tmi-sweep 1.8s ease-out forwards;
        }
        @keyframes tmi-sweep {
          0%   { transform: translateX(-110%) skewX(-14deg); opacity: 0; }
          18%  { opacity: 1; }
          100% { transform: translateX(220%) skewX(-14deg); opacity: 0; }
        }

        /* ── Diamond edge glow ── */
        .tmi-reveal__diamond-edge {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 15;
          border: 1.5px solid ${accentColor}55;
          border-radius: 2px;
          box-shadow:
            inset 0 0 40px ${accentColor}18,
            0 0 60px ${accentColor}14;
          animation: tmi-edge-pulse 3s ease-in-out forwards;
        }
        @keyframes tmi-edge-pulse {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          70%  { opacity: 0.7; }
          100% { opacity: 0; }
        }

        /* ── Particle shower ── */
        .tmi-reveal__particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          background-image:
            radial-gradient(circle, ${accentColor}44 1px, transparent 1.2px),
            radial-gradient(circle, rgba(255,255,255,0.18) 0.8px, transparent 1px);
          background-size: 24px 24px, 40px 40px;
          background-position: 0 0, 12px 12px;
          animation: tmi-particles-settle 4s ease-out forwards;
        }
        @keyframes tmi-particles-settle {
          0%   { opacity: 0; transform: translateY(-6px); }
          20%  { opacity: 0.22; }
          60%  { opacity: 0.14; transform: translateY(0); }
          100% { opacity: 0; }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .tmi-reveal,
          .tmi-reveal--subtle,
          .tmi-reveal--standard,
          .tmi-reveal--cinematic,
          .tmi-reveal--premium,
          .tmi-reveal--diamond {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .tmi-reveal__sweep,
          .tmi-reveal__diamond-edge,
          .tmi-reveal__particles {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
