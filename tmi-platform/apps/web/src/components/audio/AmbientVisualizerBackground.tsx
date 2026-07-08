'use client';

/**
 * AmbientVisualizerBackground — PlayStation XMB–style floating orbs
 * + canvas waveform bars that react to the beat in real time.
 *
 * Props
 *   isPlaying   true → energetic, beat-synced | false → slow drift, dim
 *   accentColor neon strip override (default: cyan)
 *   visible     controlled by the Ambient toggle in the drawer
 */

import { useEffect, useRef, useState } from 'react';

interface Props {
  isPlaying?: boolean;
  accentColor?: string;
  visible?: boolean;
}

// ── Orb definitions ───────────────────────────────────────────────────────────
const ORBS = [
  { id: 0,  size: 90,  left: '8%',  top: '18%', color: '#00ffff', baseOp: 0.13, dur: 13, del: -2,  blur: 28, anim: 0, phase: 0.00 },
  { id: 1,  size: 50,  left: '75%', top: '62%', color: '#ff00ff', baseOp: 0.18, dur: 9,  del: -5,  blur: 16, anim: 1, phase: 0.50 },
  { id: 2,  size: 38,  left: '45%', top: '28%', color: '#aa2dff', baseOp: 0.22, dur: 7,  del: -8,  blur: 12, anim: 2, phase: 0.25 },
  { id: 3,  size: 72,  left: '28%', top: '72%', color: '#ffd700', baseOp: 0.10, dur: 16, del: -1,  blur: 22, anim: 0, phase: 0.75 },
  { id: 4,  size: 24,  left: '86%', top: '22%', color: '#00ffff', baseOp: 0.25, dur: 6,  del: -11, blur: 8,  anim: 1, phase: 0.10 },
  { id: 5,  size: 56,  left: '18%', top: '52%', color: '#ff00ff', baseOp: 0.14, dur: 11, del: -4,  blur: 18, anim: 2, phase: 0.60 },
  { id: 6,  size: 42,  left: '62%', top: '12%', color: '#aa2dff', baseOp: 0.20, dur: 14, del: -7,  blur: 14, anim: 0, phase: 0.35 },
  { id: 7,  size: 30,  left: '50%', top: '82%', color: '#00ccff', baseOp: 0.28, dur: 8,  del: -13, blur: 10, anim: 1, phase: 0.80 },
  { id: 8,  size: 66,  left: '5%',  top: '62%', color: '#ff44cc', baseOp: 0.12, dur: 18, del: -9,  blur: 20, anim: 2, phase: 0.15 },
  { id: 9,  size: 20,  left: '92%', top: '72%', color: '#ffd700', baseOp: 0.30, dur: 7,  del: -15, blur: 6,  anim: 0, phase: 0.90 },
  { id: 10, size: 46,  left: '38%', top: '6%',  color: '#00ffff', baseOp: 0.16, dur: 10, del: -6,  blur: 15, anim: 1, phase: 0.45 },
  { id: 11, size: 34,  left: '70%', top: '44%', color: '#cc00ff', baseOp: 0.22, dur: 12, del: -3,  blur: 10, anim: 2, phase: 0.70 },
] as const;

const ANIM_NAMES = ['tmi-orb-a', 'tmi-orb-b', 'tmi-orb-c'] as const;
const WAVEFORM_BARS = 40;

// ── Waveform canvas drawing ───────────────────────────────────────────────────
function drawWaveform(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  isPlaying: boolean,
  accent: string,
) {
  ctx.clearRect(0, 0, w, h);
  const barW = w / WAVEFORM_BARS;
  const amplitude = isPlaying ? 0.85 : 0.25;
  const speed = isPlaying ? 3.5 : 0.8;

  for (let i = 0; i < WAVEFORM_BARS; i++) {
    const x = i * barW + barW * 0.15;
    // Layered sine waves → natural waveform shape
    const raw =
      Math.sin(t * speed + i * 0.55) *
      Math.sin(t * speed * 0.41 + i * 1.1) *
      Math.sin(t * speed * 0.17 + i * 0.23);
    const barH = Math.max(2, Math.abs(raw) * amplitude * h);
    const y = (h - barH) / 2;

    // Gradient per bar (brighter center)
    const grad = ctx.createLinearGradient(x, y, x, y + barH);
    const cAlpha = isPlaying ? 0.9 : 0.35;
    grad.addColorStop(0, accent + Math.round(cAlpha * 255).toString(16).padStart(2, '0'));
    grad.addColorStop(0.5, '#ff00ff' + Math.round(cAlpha * 0.7 * 255).toString(16).padStart(2, '0'));
    grad.addColorStop(1, accent + Math.round(cAlpha * 255).toString(16).padStart(2, '0'));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW * 0.7, barH, 2);
    ctx.fill();
  }
}

// ── Beat ring ─────────────────────────────────────────────────────────────────
// A ring that expands from center on every "downbeat" (when beatPulse flips)
interface RingState { key: number; startedAt: number }

export default function AmbientVisualizerBackground({
  isPlaying = false,
  accentColor = '#00ffff',
  visible = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Beat pulse — flips true for 120ms every ~500ms (120 BPM)
  const [beatPulse, setBeatPulse] = useState(false);
  const [rings, setRings] = useState<RingState[]>([]);
  const beatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Canvas waveform RAF loop ────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) { cancelAnimationFrame(rafRef.current); return; }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (ts: number) => {
      timeRef.current = ts / 1000;
      const { width: w, height: h } = canvas;
      drawWaveform(ctx, w, h, timeRef.current, isPlaying, accentColor);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, visible, accentColor]);

  // ── Beat pulse timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (beatTimerRef.current) clearTimeout(beatTimerRef.current);
    if (!isPlaying || !visible) { setBeatPulse(false); return; }

    const BPM = 120;
    const beatMs = (60 / BPM) * 1000; // ~500ms
    let cancelled = false;

    const doPulse = () => {
      if (cancelled) return;
      // Spawn a ring
      setRings((prev) => [...prev.slice(-3), { key: Date.now(), startedAt: Date.now() }]);
      setBeatPulse(true);
      beatTimerRef.current = setTimeout(() => {
        if (!cancelled) setBeatPulse(false);
        beatTimerRef.current = setTimeout(doPulse, beatMs * 0.85);
      }, beatMs * 0.18);
    };

    doPulse();
    return () => {
      cancelled = true;
      if (beatTimerRef.current) clearTimeout(beatTimerRef.current);
    };
  }, [isPlaying, visible]);

  // Clean up expired rings
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setRings((prev) => prev.filter((r) => now - r.startedAt < 1200));
    }, 300);
    return () => clearInterval(t);
  }, []);

  if (!visible) return null;

  const opMult = isPlaying ? 1.7 : 0.65;
  const durMult = isPlaying ? 1 : 2.8;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* ── Keyframes ──────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes tmi-orb-a {
          0%   { transform: translate(0px, 0px) scale(1); }
          20%  { transform: translate(22px, -28px) scale(1.06); }
          50%  { transform: translate(-14px, -56px) scale(0.93); }
          75%  { transform: translate(26px, -32px) scale(1.09); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes tmi-orb-b {
          0%   { transform: translate(0px, 0px) scale(1); }
          30%  { transform: translate(-26px, 20px) scale(1.1); }
          65%  { transform: translate(30px, -44px) scale(0.91); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes tmi-orb-c {
          0%   { transform: translate(0px, 0px) scale(1); }
          18%  { transform: translate(16px, 26px) scale(1.07); }
          48%  { transform: translate(-30px, -16px) scale(0.92); }
          78%  { transform: translate(10px, 34px) scale(1.05); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes tmi-ring-expand {
          0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
        }
        @keyframes tmi-scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>

      {/* ── Depth grid ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: [
          'linear-gradient(rgba(0,255,255,0.022) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(0,255,255,0.022) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '48px 48px',
        opacity: isPlaying ? 0.85 : 0.35,
        transition: 'opacity 1.8s ease',
      }} />

      {/* ── Floating orbs ───────────────────────────────────────────────────── */}
      {ORBS.map((orb) => {
        // Beat-reactive: orbs with phase close to 0 get a scale boost on downbeat
        const beatBoost = beatPulse ? (1 + 0.22 * Math.cos(orb.phase * Math.PI * 2)) : 1;
        return (
          <div
            key={orb.id}
            style={{
              position: 'absolute',
              left: orb.left,
              top: orb.top,
              width: orb.size * beatBoost,
              height: orb.size * beatBoost,
              borderRadius: '50%',
              background: `radial-gradient(circle at 38% 38%, ${orb.color}dd, ${orb.color}44 50%, transparent 80%)`,
              filter: `blur(${orb.blur}px)`,
              opacity: Math.min(1, orb.baseOp * opMult * (beatPulse ? 1.3 : 1)),
              animation: `${ANIM_NAMES[orb.anim]} ${orb.dur * durMult}s ease-in-out ${orb.del}s infinite`,
              transition: 'width 0.12s ease, height 0.12s ease, opacity 0.18s ease',
              willChange: 'transform, width, height',
            }}
          />
        );
      })}

      {/* ── Beat rings ──────────────────────────────────────────────────────── */}
      {rings.map((ring) => (
        <div
          key={ring.key}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: `1px solid ${accentColor}88`,
            boxShadow: `0 0 12px 2px ${accentColor}44, inset 0 0 8px ${accentColor}22`,
            animation: 'tmi-ring-expand 1.1s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Waveform bars (canvas) ───────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '8%',
        right: '8%',
        transform: 'translateY(-50%)',
        height: 48,
        opacity: isPlaying ? 0.55 : 0.2,
        transition: 'opacity 1s ease',
      }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={48}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* ── Scanline stripe (retrowave feel) ──────────────────────────────── */}
      {isPlaying && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,255,255,0.018) 50%, transparent 100%)',
          animation: 'tmi-scanline 4s linear infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* ── "Light under the door" — bottom neon strip ────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg,
          transparent 0%,
          ${accentColor}${beatPulse ? 'cc' : '80'} 20%,
          #ff00ff${beatPulse ? 'cc' : '99'} 50%,
          ${accentColor}${beatPulse ? 'cc' : '80'} 80%,
          transparent 100%
        )`,
        boxShadow: beatPulse
          ? `0 0 16px 4px ${accentColor}88, 0 0 36px 8px #ff00ff44, 0 0 60px 12px ${accentColor}22`
          : `0 0 8px 2px ${accentColor}55, 0 0 20px 4px #ff00ff33`,
        transition: 'box-shadow 0.15s ease, background 0.15s ease',
        opacity: isPlaying ? 1 : 0.45,
      }} />

      {/* ── Top edge mirror ────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}33 40%, #ff00ff22 60%, transparent)`,
        opacity: isPlaying ? 0.7 : 0.3,
        transition: 'opacity 1.2s ease',
      }} />

      {/* ── Center radial bloom ─────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 320,
        height: 180,
        borderRadius: '50%',
        background: `radial-gradient(ellipse at center, ${accentColor}${beatPulse ? '18' : '0a'} 0%, transparent 70%)`,
        opacity: isPlaying ? 0.8 : 0.3,
        transition: 'opacity 2s ease, background 0.15s ease',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
