"use client";
/**
 * MusicVisualizer Component
 *
 * Canvas-based render of any VisualizerType from musicVisualizerEngine.
 * Receives config + BPM tick from parent, produces a live animated frame.
 *
 * Usage:
 *   <MusicVisualizer config={vizConfig} tick={bpmTick} signal="beat" width={600} height={300} />
 */

import { useEffect, useRef, useCallback } from 'react';
import type { VisualizerConfig, VisualizerFrame, AudioSignal } from '@/lib/visualizer/musicVisualizerEngine';
import { getVisualizerFrame } from '@/lib/visualizer/musicVisualizerEngine';

interface MusicVisualizerProps {
  config: VisualizerConfig;
  tick: number;
  signal?: AudioSignal;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  className?: string;
}

// ─── Canvas rendering helpers ─────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function renderFrame(ctx: CanvasRenderingContext2D, w: number, h: number, frame: VisualizerFrame): void {
  // Background
  ctx.fillStyle = frame.dropFlash
    ? hexToRgba(frame.primaryColor, 0.15)
    : frame.backgroundColor;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  switch (frame.type) {
    // ── EQ Bars / Music Mountains ───────────────────────────────────────
    case 'equalizer-bars':
    case 'music-mountains': {
      const bars = frame.bars;
      if (!bars.length) break;
      const barW = w / bars.length;
      bars.forEach((bar, i) => {
        const barH = bar.height * h * 0.85;
        const x = i * barW;
        const y = h - barH;
        const grad = ctx.createLinearGradient(x, h, x, y);
        grad.addColorStop(0, hexToRgba(bar.color, 0.9));
        grad.addColorStop(1, hexToRgba(bar.color, 0.3));
        ctx.fillStyle = grad;
        ctx.fillRect(x + 1, y, barW - 2, barH);
        // Glow top cap
        ctx.fillStyle = hexToRgba(bar.color, 0.8);
        ctx.fillRect(x + 1, y, barW - 2, 3);
      });
      break;
    }

    // ── Circular Spectrum ──────────────────────────────────────────────
    case 'circular-spectrum': {
      const bars = frame.bars;
      if (!bars.length) break;
      const radius = Math.min(w, h) * 0.3;
      bars.forEach((bar, i) => {
        const angle = (i / bars.length) * Math.PI * 2 + (frame.orbitAngle * Math.PI) / 180;
        const len = bar.height * radius * 0.8;
        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + len);
        const y2 = cy + Math.sin(angle) * (radius + len);
        ctx.strokeStyle = hexToRgba(bar.color, 0.9);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      // Core circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(frame.primaryColor, 0.3);
      ctx.fill();
      break;
    }

    // ── Waveform / Ocean Waves ─────────────────────────────────────────
    case 'waveform':
    case 'ocean-waves': {
      const pts = frame.terrain;
      if (!pts.length) break;
      ctx.beginPath();
      pts.forEach((p, i) => {
        const x = p.x * w;
        const y = cy + (p.height - 0.5) * h * 0.8;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = hexToRgba(frame.primaryColor, 0.9);
      ctx.lineWidth = 2;
      ctx.stroke();
      // Fill below
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, hexToRgba(frame.primaryColor, 0.4));
      grad.addColorStop(1, hexToRgba(frame.backgroundColor, 0));
      ctx.fillStyle = grad;
      ctx.fill();
      break;
    }

    // ── Retro Lines / Sunset Grid ──────────────────────────────────────
    case 'retro-lines':
    case 'sunset-grid': {
      // Perspective grid
      const lines = 12;
      for (let i = 0; i < lines; i++) {
        const t = i / lines;
        const y = cy + t * (h - cy);
        ctx.strokeStyle = hexToRgba(frame.primaryColor, 0.15 + t * 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      const vLines = 10;
      for (let i = 0; i <= vLines; i++) {
        const t = i / vLines;
        ctx.strokeStyle = hexToRgba(frame.accentColor, 0.2);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(t * w, h);
        ctx.stroke();
      }
      break;
    }

    // ── Particles: Explosion / Galaxy / Stars / Smoke / Fire ──────────
    case 'particle-explosion':
    case 'galaxy':
    case 'star-field':
    case 'smoke-clouds':
    case 'fire': {
      frame.particles.forEach(p => {
        const x = p.x * w;
        const y = p.y * h;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(p.color, p.life);
        ctx.fill();
      });
      break;
    }

    // ── Water Ripple ───────────────────────────────────────────────────
    case 'water-ripple': {
      frame.ripples.forEach(r => {
        const radius = r.radius * Math.min(w, h) * 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(r.color, r.alpha);
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      break;
    }

    // ── Spiral ────────────────────────────────────────────────────────
    case 'spiral': {
      const turns = 5;
      const maxR = Math.min(w, h) * 0.4;
      const steps = 200;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * turns * Math.PI * 2 + (frame.orbitAngle * Math.PI) / 180;
        const r = t * maxR * frame.intensity;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = hexToRgba(frame.primaryColor, 0.8);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;
    }

    // ── Neon Grid ─────────────────────────────────────────────────────
    case 'neon-grid': {
      const gridSize = 40;
      const cols = Math.ceil(w / gridSize);
      const rows = Math.ceil(h / gridSize);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const pulse = Math.sin(r * 0.4 + c * 0.3 + frame.tick * 0.15) * 0.5 + 0.5;
          const alpha = pulse * frame.intensity * 0.7;
          ctx.strokeStyle = hexToRgba(frame.primaryColor, alpha);
          ctx.lineWidth = 1;
          ctx.strokeRect(c * gridSize + 1, r * gridSize + 1, gridSize - 2, gridSize - 2);
          if (alpha > 0.5) {
            ctx.fillStyle = hexToRgba(frame.primaryColor, alpha * 0.15);
            ctx.fillRect(c * gridSize + 1, r * gridSize + 1, gridSize - 2, gridSize - 2);
          }
        }
      }
      break;
    }

    // ── Tunnel ────────────────────────────────────────────────────────
    case 'tunnel': {
      const rings = 10;
      for (let i = rings; i > 0; i--) {
        const r = (i / rings + (frame.tick * 0.02 * frame.config?.speed ?? 0.02)) % 1;
        const radius = r * Math.min(w, h) * 0.5;
        const alpha = (1 - r) * 0.7 * frame.intensity;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(i % 2 === 0 ? frame.primaryColor : frame.accentColor, alpha);
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }

    // ── Lightning ─────────────────────────────────────────────────────
    case 'lightning': {
      if (frame.signal === 'drop' || frame.signal === 'bass') {
        const bolt = (sx: number, sy: number, ex: number, ey: number, depth: number) => {
          if (depth === 0) { ctx.lineTo(ex, ey); return; }
          const mx = (sx + ex) / 2 + (Math.random() - 0.5) * 60;
          const my = (sy + ey) / 2 + (Math.random() - 0.5) * 30;
          bolt(sx, sy, mx, my, depth - 1);
          bolt(mx, my, ex, ey, depth - 1);
        };
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + (Math.random() - 0.5) * w * 0.5, 0);
          bolt(cx, 0, cx + (Math.random() - 0.5) * w * 0.3, h, 3);
          ctx.strokeStyle = hexToRgba(frame.primaryColor, 0.9);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      break;
    }

    // ── Planet Orbit ──────────────────────────────────────────────────
    case 'planet-orbit': {
      // Sun
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba('#FFD700', 0.9);
      ctx.fill();
      // Orbit paths + planets
      const planets = [
        { dist: 0.28, size: 6, color: frame.primaryColor, speed: 1 },
        { dist: 0.38, size: 8, color: frame.accentColor, speed: 0.6 },
        { dist: 0.48, size: 5, color: '#00FF88', speed: 0.4 },
      ];
      planets.forEach(pl => {
        const angle = (frame.orbitAngle * pl.speed * Math.PI) / 180;
        const r = pl.dist * Math.min(w, h) * 0.5;
        // Orbit ring
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(pl.color, 0.15);
        ctx.lineWidth = 1;
        ctx.stroke();
        // Planet
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(px, py, pl.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(pl.color, 0.9);
        ctx.fill();
      });
      break;
    }

    // ── Matrix Code ───────────────────────────────────────────────────
    case 'matrix-code': {
      const cols = Math.floor(w / 14);
      for (let c = 0; c < cols; c++) {
        const rows = Math.floor(h / 16);
        for (let r = 0; r < rows; r++) {
          const alpha = Math.random() * 0.7 * frame.intensity;
          if (alpha > 0.3) {
            ctx.fillStyle = hexToRgba(frame.primaryColor, alpha);
            ctx.font = '12px monospace';
            ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), c * 14, r * 16);
          }
        }
      }
      break;
    }

    // ── City Lights ──────────────────────────────────────────────────
    case 'city-lights': {
      // Skyline silhouette
      const buildings = [
        { x: 0.05, w: 0.08, h: 0.6 }, { x: 0.14, w: 0.06, h: 0.45 },
        { x: 0.21, w: 0.1, h: 0.75 }, { x: 0.32, w: 0.07, h: 0.5 },
        { x: 0.4, w: 0.12, h: 0.85 }, { x: 0.53, w: 0.08, h: 0.6 },
        { x: 0.62, w: 0.1, h: 0.7 }, { x: 0.73, w: 0.06, h: 0.45 },
        { x: 0.8, w: 0.09, h: 0.65 }, { x: 0.9, w: 0.07, h: 0.5 },
      ];
      buildings.forEach(b => {
        ctx.fillStyle = hexToRgba('#0A0A1A', 0.95);
        ctx.fillRect(b.x * w, h - b.h * h, b.w * w, b.h * h);
        // Windows
        const winW = b.w * w * 0.3;
        const winH = 5;
        for (let row = 1; row < Math.floor(b.h * h / 12); row++) {
          for (let col = 0; col < 3; col++) {
            if (Math.random() > 0.5) {
              ctx.fillStyle = hexToRgba(frame.accentColor, 0.6 + Math.random() * 0.4);
              ctx.fillRect(b.x * w + col * (winW + 4) + 3, h - b.h * h + row * 12, winW, winH);
            }
          }
        }
      });
      break;
    }

    // ── Audio Terrain / Generic fallback ─────────────────────────────
    default: {
      const pts = frame.terrain.length > 0 ? frame.terrain : frame.bars.map((b, i) => ({
        x: i / Math.max(frame.bars.length - 1, 1),
        height: b.height,
        color: b.color,
      }));
      if (!pts.length) break;
      ctx.beginPath();
      ctx.moveTo(0, h);
      pts.forEach(p => {
        const x = p.x * w;
        const y = h - p.height * h * 0.8;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(w, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, hexToRgba(frame.primaryColor, 0.7));
      grad.addColorStop(1, hexToRgba(frame.backgroundColor, 0.1));
      ctx.fillStyle = grad;
      ctx.fill();
      break;
    }
  }

  // Drop flash overlay
  if (frame.dropFlash) {
    ctx.fillStyle = hexToRgba(frame.primaryColor, 0.08);
    ctx.fillRect(0, 0, w, h);
  }
}

// ─── Component ────────────────────────────────────────────────────────────

export default function MusicVisualizer({
  config,
  tick,
  signal = 'beat',
  width = 600,
  height = 200,
  style,
  className,
}: MusicVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<VisualizerFrame | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = getVisualizerFrame(config, tick, signal);
    // Attach config ref for types that need speed etc. at render time
    (frame as VisualizerFrame & { config?: VisualizerConfig }).config = config;
    frameRef.current = frame;

    renderFrame(ctx, canvas.width, canvas.height, frame);
  }, [config, tick, signal]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        display: 'block',
        borderRadius: 8,
        ...style,
      }}
    />
  );
}
