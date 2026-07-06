'use client';

/**
 * AmbientVisualizer — beat-reactive background layer for the Bottom Media Dock.
 *
 * Supports multiple shape types that rise and pulse:
 *   orb, disc, music-note, money, star, diamond, heart, crown, lightning, wave
 *
 * Shape presets evolve over time — the system tracks which shapes have been
 * shown and rotates through them to keep the visual fresh. Shapes can be
 * extended at any time by adding to SHAPE_CATALOG.
 *
 * Reads VisualSettingsStore — renders nothing if lowMotionMode is on.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualSettings } from '@/lib/experience/VisualSettingsStore';
import { ThemeEngine, type VisualScene } from '@/lib/design/ThemeEngine';
import { ExperienceOrchestrator } from '@/lib/experience/ExperienceOrchestrator';

// ── Shape catalog — extendable at any time ────────────────────────────────────

export type AmbientShape =
  | 'orb'       // soft glowing circle
  | 'disc'      // vinyl disc (music)
  | 'music-note'// ♪ rising note
  | 'money'     // 💰 dollar / coins
  | 'star'      // ✦ sparkle
  | 'diamond'   // ◆ gem / tier
  | 'heart'     // ♥ fan love
  | 'crown'     // ♛ ranking
  | 'lightning' // ⚡ energy
  | 'wave';     // sound wave arc

const SHAPE_GLYPHS: Record<AmbientShape, string> = {
  'orb':        '',          // rendered as CSS circle, no glyph
  'disc':       '◎',
  'music-note': '♪',
  'money':      '💰',
  'star':       '✦',
  'diamond':    '◆',
  'heart':      '♥',
  'crown':      '♛',
  'lightning':  '⚡',
  'wave':       '〰',
};

// Default rotation order — system evolves through these
const DEFAULT_SHAPE_ROTATION: AmbientShape[] = [
  'orb', 'disc', 'music-note', 'star', 'orb', 'money',
  'diamond', 'heart', 'crown', 'lightning', 'orb', 'wave',
];

// ── Orb configs for the large ambient blobs ───────────────────────────────────

const ORB_CONFIGS = [
  { w: 280, h: 280, x: '8%',  y: '60%', color: '#AA2DFF', dur: 7.2 },
  { w: 200, h: 200, x: '32%', y: '30%', color: '#FF2DAA', dur: 9.4 },
  { w: 240, h: 240, x: '55%', y: '70%', color: '#00FFFF', dur: 8.1 },
  { w: 180, h: 180, x: '75%', y: '25%', color: '#FFD700', dur: 6.8 },
  { w: 160, h: 160, x: '90%', y: '65%', color: '#00FF88', dur: 10.2 },
];

const PARTICLE_COUNT = 18;
const SHAPE_STORAGE_KEY = 'tmi.ambient.shape.index.v1';

interface AmbientVisualizerProps {
  /** Primary accent color — orbs and waveform take their hues from this */
  accentColor?: string;
  /** 0–1 audio amplitude for beat reactivity (update from audio analyser) */
  amplitude?: number;
  /** Height of the visualizer container */
  height?: number | string;
  /** Override shape rotation — defaults to DEFAULT_SHAPE_ROTATION */
  shapeSet?: AmbientShape[];
}

export default function AmbientVisualizer({
  accentColor = '#AA2DFF',
  amplitude = 0,
  height = '100%',
  shapeSet,
}: AmbientVisualizerProps) {
  const [settings] = useVisualSettings();

  // Subscribe to ThemeEngine for live theme + scene changes
  const [themeTokens, setThemeTokens] = useState(() => ThemeEngine.getTokens());
  useEffect(() => ThemeEngine.subscribe(setThemeTokens), []);

  // Subscribe to ExperienceOrchestrator to auto-switch scene
  useEffect(() => {
    const sceneMap: Array<{ event: Parameters<typeof ExperienceOrchestrator.on>[0]; scene: VisualScene }> = [
      { event: 'PLAYLIST_CHANGED',  scene: 'playlist' },
      { event: 'BATTLE_START',      scene: 'battle' },
      { event: 'ACHIEVEMENT_UNLOCKED', scene: 'celebration' },
      { event: 'CONSENSUS_AWARD',   scene: 'celebration' },
      { event: 'XP_GAINED',         scene: 'tips-received' },
      { event: 'WORLD_PREMIERE',    scene: 'money-wall' },
      { event: 'SHOW_ENDED',        scene: 'default' },
    ];
    const unsubs = sceneMap.map(({ event, scene }) =>
      ExperienceOrchestrator.on(event as Parameters<typeof ExperienceOrchestrator.on>[0], () => {
        ThemeEngine.setScene(scene);
        setThemeTokens(ThemeEngine.getTokens());
      })
    );
    return () => unsubs.forEach(u => u());
  }, []);

  // Use theme colors when no explicit accentColor override is passed
  const resolvedAccent = accentColor !== '#AA2DFF' ? accentColor : themeTokens.primary;
  const themeParticleColors = themeTokens.particleColors;

  // Evolution: cycle through shapes so the visualizer never looks the same twice.
  // The index is persisted so it picks up where it left off across sessions.
  const shapes = shapeSet ?? themeTokens.particleShapes;
  const [shapeIdx, setShapeIdx] = useState<number>(() => {
    try { return parseInt(localStorage.getItem(SHAPE_STORAGE_KEY) ?? '0', 10) || 0; } catch { return 0; }
  });

  // Evolve the active shape set every 20 seconds (independent of beat)
  useEffect(() => {
    if (!settings.particleEffects || settings.lowMotionMode) return;
    const t = setInterval(() => {
      setShapeIdx(prev => {
        const next = (prev + 1) % shapes.length;
        try { localStorage.setItem(SHAPE_STORAGE_KEY, String(next)); } catch { /* ignore */ }
        return next;
      });
    }, 20_000);
    return () => clearInterval(t);
  }, [settings.particleEffects, settings.lowMotionMode, shapes.length]);

  const activeShape = (shapes[shapeIdx % shapes.length] ?? 'orb') as AmbientShape;
  const activeGlyph = SHAPE_GLYPHS[activeShape] ?? '';

  const active = !settings.lowMotionMode && (
    settings.ambientOrbs || settings.beatReactive || settings.motionBackground || settings.particleEffects
  );

  if (!active) return null;

  const beatScale = 1 + (settings.beatReactive ? amplitude * 0.4 : 0) * themeTokens.glowIntensity;
  const beatOpacity = 0.5 + (settings.beatReactive ? amplitude * 0.5 : 0) * themeTokens.glowIntensity;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      height, pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
    }}>
      <style>{`
        @keyframes tmiOrbDrift {
          0%   { transform: translate(-50%,-50%) scale(0.8); opacity:0.4; }
          50%  { transform: translate(-52%,-48%) scale(1.15); opacity:0.9; }
          100% { transform: translate(-50%,-50%) scale(0.8); opacity:0.4; }
        }
        @keyframes tmiParticleRise {
          0%   { transform: translateY(0) scale(1); opacity:0.8; }
          100% { transform: translateY(-120px) scale(0.2); opacity:0; }
        }
        @keyframes tmiWaveform {
          0%,100% { scaleY:0.6; opacity:0.35; }
          50%     { scaleY:1.2; opacity:0.7; }
        }
      `}</style>

      {/* Ambient orbs */}
      {settings.ambientOrbs && ORB_CONFIGS.map((orb, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: orb.x, top: orb.y,
          width: orb.w * beatScale, height: orb.h * beatScale,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${orb.color}${Math.round(beatOpacity * 40).toString(16).padStart(2,'0')} 0%, transparent 70%)`,
          animation: `tmiOrbDrift ${orb.dur}s ease-in-out infinite`,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.1s, height 0.1s',
        }} />
      ))}

      {/* Beat-reactive particles — shape evolves over time */}
      {settings.particleEffects && Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const colors = themeParticleColors.length > 0 ? themeParticleColors : [resolvedAccent, '#FF2DAA', '#00FF88', '#FFD700'];
        const color = colors[i % colors.length]!;
        const useGlyph = activeShape !== 'orb' && activeGlyph;
        const size = (useGlyph ? 12 : 4) + (i % 3) * (useGlyph ? 4 : 2);
        return (
          <div key={`p${shapeIdx}-${i}`} style={{
            position: 'absolute',
            left: `${(i / PARTICLE_COUNT) * 100}%`,
            bottom: `${4 + (i % 4) * 6}%`,
            width: size, height: size,
            borderRadius: useGlyph ? 0 : '50%',
            background: useGlyph ? 'transparent' : color,
            color: useGlyph ? color : undefined,
            fontSize: useGlyph ? size : undefined,
            lineHeight: 1,
            display: useGlyph ? 'flex' : undefined,
            alignItems: useGlyph ? 'center' : undefined,
            justifyContent: useGlyph ? 'center' : undefined,
            opacity: (0.6 + amplitude * 0.4) * (useGlyph ? 0.85 : 1),
            filter: `drop-shadow(0 0 ${3 + amplitude * 8}px ${color})`,
            animation: `tmiParticleRise ${2.5 + (i % 5) * 0.6}s ease-out infinite`,
            animationDelay: `${(i * 0.18) % 3}s`,
            userSelect: 'none',
          }}>
            {useGlyph ? activeGlyph : null}
          </div>
        );
      })}

      {/* Waveform ribbon */}
      {settings.ambientOrbs && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 28 + amplitude * 16,
          background: `linear-gradient(0deg, ${resolvedAccent}${Math.round(beatOpacity * 50).toString(16).padStart(2,'0')} 0%, transparent 100%)`,
          transition: 'height 0.12s ease, opacity 0.12s ease',
        }} />
      )}

      {/* Motion background drift */}
      {settings.motionBackground && (
        <div style={{
          position: 'absolute', inset: '-20%',
          background: `radial-gradient(ellipse at 30% 50%, ${resolvedAccent}0a 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, ${themeTokens.secondary}08 0%, transparent 50%)`,
          animation: 'tmiOrbDrift 15s ease-in-out infinite',
        }} />
      )}
    </div>
  );
}

// ── Visual Settings Panel — drop into Settings page or Advanced modal ─────────

export function VisualSettingsPanel({ accentColor = '#AA2DFF' }: { accentColor?: string }) {
  const [settings, update] = useVisualSettings();

  const items: { key: keyof typeof settings; label: string; desc: string }[] = [
    { key: 'ambientOrbs',      label: 'Ambient Orbs',          desc: 'Glowing color orbs in backgrounds and drawers' },
    { key: 'beatReactive',     label: 'Beat Reactive',         desc: 'Effects pulse with the audio playing' },
    { key: 'motionBackground', label: 'Motion Background',     desc: 'Slow-moving light behind panels' },
    { key: 'particleEffects',  label: 'Particle Effects',      desc: 'Rising particles in the media dock' },
    { key: 'lowMotionMode',    label: 'Low Motion Mode',       desc: 'Disable all motion effects (accessibility)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
        VISUAL EXPERIENCE
      </div>
      {items.map(item => (
        <div
          key={item.key}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
          }}
          onClick={() => update({ [item.key]: !settings[item.key] })}
        >
          <div>
            <div style={{ fontSize: 11, color: '#fff', fontWeight: item.key === 'lowMotionMode' ? 700 : 400 }}>{item.label}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{item.desc}</div>
          </div>
          {/* Toggle pill */}
          <div style={{
            width: 34, height: 18, borderRadius: 9, flexShrink: 0,
            background: settings[item.key]
              ? item.key === 'lowMotionMode' ? '#FFD700' : accentColor
              : 'rgba(255,255,255,0.12)',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 2, width: 14, height: 14, borderRadius: '50%',
              background: '#fff', transition: 'left 0.2s',
              left: settings[item.key] ? 18 : 2,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
