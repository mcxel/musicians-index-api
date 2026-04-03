/**
 * Music Visualizer Engine
 *
 * State + frame data for 21 BPM-reactive visualizer types that render inside
 * a canvas or CSS animation layer. This engine is purely state/data — it does
 * NOT import React or call DOM APIs directly. Components consume its output.
 *
 * Architecture:
 *   Engine produces VisualizerFrame → MusicVisualizer component renders it
 *   BPM tick → reactToBeat() → updated particle positions / bar heights / etc.
 *   Audio signals (bass, snare, melody, drop) amplify specific layers.
 */

// ─── Visualizer Types ────────────────────────────────────────────────────────

export type VisualizerType =
  | 'equalizer-bars'      // Classic EQ bar graph, BPM-pumped heights
  | 'waveform'            // Oscillating wave line
  | 'circular-spectrum'   // Circular frequency ring (radial bars)
  | 'particle-explosion'  // Particles burst outward on beat
  | 'neon-grid'           // Pulsing neon floor grid squares
  | 'tunnel'              // Concentric rings rushing at viewer
  | 'spiral'              // Rotating Fibonacci-style spiral
  | 'galaxy'              // Star field with core rotation
  | 'fire'                // Upward fire particles, bass-driven height
  | 'water-ripple'        // Expanding concentric ripples
  | 'lightning'           // Random branch bolts on drop
  | 'city-lights'         // City skyline with window flicker
  | 'matrix-code'         // Falling character streams
  | 'retro-lines'         // Horizontal scan line waves (VHS style)
  | 'sunset-grid'         // 80s retrowave perspective grid
  | 'ocean-waves'         // Layered sine wave ocean
  | 'smoke-clouds'        // Drifting smoke billows
  | 'star-field'          // Space star zoom rush
  | 'planet-orbit'        // Orbiting planet system
  | 'music-mountains'     // Mountain silhouette driven by beat
  | 'audio-terrain';      // Animated height-map terrain

// ─── Audio Signal Types ───────────────────────────────────────────────────

export type AudioSignal = 'beat' | 'bass' | 'snare' | 'melody' | 'drop' | 'ambient' | 'silence';

// ─── Core State / Frame types ─────────────────────────────────────────────

export interface VisualizerConfig {
  type: VisualizerType;
  bpm: number;               // Current BPM (drives animation timing)
  intensity: number;         // 0–1 overall amplitude
  speed: number;             // 0.5–3.0 global animation multiplier
  primaryColor: string;      // From venue skin palette
  accentColor: string;       // Secondary color
  backgroundColor: string;   // Canvas background
  reactive: boolean;         // If true, responds to beat signals
  mirrorX: boolean;          // Mirror horizontally (for symmetry)
  particleCount: number;     // For particle-based types
}

export interface Bar {
  height: number;   // 0–1 normalized
  color: string;
}

export interface Particle {
  x: number;      // 0–1 normalized position
  y: number;
  vx: number;     // velocity
  vy: number;
  life: number;   // 0–1, decreases each frame
  size: number;
  color: string;
}

export interface RippleRing {
  radius: number;  // 0–1 normalized
  alpha: number;   // opacity 0–1
  color: string;
}

export interface TerrainPoint {
  x: number;    // 0–1 normalized
  height: number; // 0–1 normalized
  color: string;
}

/**
 * VisualizerFrame — everything the render layer needs for one animation tick.
 * Components destructure this to render bars, particles, paths, etc.
 */
export interface VisualizerFrame {
  type: VisualizerType;
  tick: number;              // Monotonically increasing beat tick
  bpmPhase: number;          // 0–1 phase within current beat
  intensity: number;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  // Type-specific payloads (only relevant fields populated per type):
  bars: Bar[];               // equalizer-bars, circular-spectrum, music-mountains
  particles: Particle[];     // particle-explosion, fire, galaxy, star-field, smoke-clouds
  ripples: RippleRing[];     // water-ripple, waveform
  terrain: TerrainPoint[];   // audio-terrain, ocean-waves, sunset-grid, retro-lines
  orbitAngle: number;        // spiral, planet-orbit, circular-spectrum
  dropFlash: boolean;        // true for 2 frames after a drop event
  signal: AudioSignal;
}

// ─── Default configs ──────────────────────────────────────────────────────

export function defaultVisualizerConfig(
  overrides?: Partial<VisualizerConfig>,
): VisualizerConfig {
  return {
    type: 'equalizer-bars',
    bpm: 128,
    intensity: 0.8,
    speed: 1.0,
    primaryColor: '#00FFFF',
    accentColor: '#FF2DAA',
    backgroundColor: '#050510',
    reactive: true,
    mirrorX: true,
    particleCount: 60,
    ...overrides,
  };
}

function emptyFrame(config: VisualizerConfig, tick: number): VisualizerFrame {
  return {
    type: config.type,
    tick,
    bpmPhase: 0,
    intensity: config.intensity,
    primaryColor: config.primaryColor,
    accentColor: config.accentColor,
    backgroundColor: config.backgroundColor,
    bars: [],
    particles: [],
    ripples: [],
    terrain: [],
    orbitAngle: 0,
    dropFlash: false,
    signal: 'beat',
  };
}

// ─── Color helpers ────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

function blendColors(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  return rgbToHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
}

// ─── Frame generators per type ───────────────────────────────────────────

function makeBars(config: VisualizerConfig, tick: number, signal: AudioSignal, count = 24): Bar[] {
  const bassBoost = signal === 'bass' || signal === 'drop' ? 0.4 : 0;
  return Array.from({ length: count }, (_, i) => {
    const phase = (i / count) * Math.PI * 2;
    const wave = Math.sin(phase + tick * 0.3) * 0.5 + 0.5;
    const height = Math.max(0.05, wave * config.intensity + bassBoost * Math.random());
    const t = i / count;
    return { height: Math.min(height, 1), color: blendColors(config.primaryColor, config.accentColor, t) };
  });
}

function makeParticles(
  config: VisualizerConfig,
  existing: Particle[],
  signal: AudioSignal,
  tick: number,
): Particle[] {
  // Age existing
  const aged = existing
    .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.002, life: p.life - 0.025 }))
    .filter(p => p.life > 0 && p.x >= 0 && p.x <= 1 && p.y >= -0.2 && p.y <= 1.2);

  // Burst on drop or beat
  const burst = (signal === 'drop' || signal === 'beat') && tick % 2 === 0;
  if (!burst || aged.length > config.particleCount) return aged;

  const count = signal === 'drop' ? 20 : 5;
  const newParticles: Particle[] = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.012 + 0.004) * config.intensity;
    const colors = [config.primaryColor, config.accentColor, '#FFD700', '#00FF88', '#FF9500'];
    return {
      x: 0.5 + (Math.random() - 0.5) * 0.3,
      y: 0.5 + (Math.random() - 0.5) * 0.3,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.01,
      life: 0.8 + Math.random() * 0.2,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });

  return [...aged, ...newParticles];
}

function makeRipples(existing: RippleRing[], signal: AudioSignal, config: VisualizerConfig, tick: number): RippleRing[] {
  // Age existing
  const aged = existing
    .map(r => ({ ...r, radius: r.radius + 0.018 * config.speed, alpha: r.alpha * 0.94 }))
    .filter(r => r.alpha > 0.02 && r.radius < 1.2);

  // New ring on beat
  if (signal === 'beat' || signal === 'bass') {
    aged.push({ radius: 0.05, alpha: 0.9, color: tick % 2 === 0 ? config.primaryColor : config.accentColor });
  }
  return aged;
}

function makeTerrain(config: VisualizerConfig, tick: number, signal: AudioSignal, points = 32): TerrainPoint[] {
  const bassBoost = signal === 'bass' || signal === 'drop' ? 0.3 : 0;
  return Array.from({ length: points }, (_, i) => {
    const x = i / (points - 1);
    const wave = Math.sin(x * Math.PI * 4 + tick * 0.2 * config.speed) * 0.3
                + Math.sin(x * Math.PI * 7 - tick * 0.15 * config.speed) * 0.15;
    const height = Math.max(0.05, (wave + 0.5) * config.intensity + bassBoost);
    return { x, height: Math.min(height, 1), color: blendColors(config.primaryColor, config.accentColor, x) };
  });
}

// ─── Core tick function ───────────────────────────────────────────────────

let _particles: Particle[] = [];
let _ripples: RippleRing[] = [];
let _orbitAngle = 0;
let _dropFlashFrames = 0;

/**
 * Compute one animation frame.
 * Caller should invoke this at requestAnimationFrame rate (or on a BPM-tied timer).
 *
 * @param config  Current visualizer config
 * @param tick    Monotonically increasing frame/beat counter
 * @param signal  Current audio signal type (drives reactive behaviour)
 */
export function getVisualizerFrame(
  config: VisualizerConfig,
  tick: number,
  signal: AudioSignal = 'beat',
): VisualizerFrame {
  const frame = emptyFrame(config, tick);
  const bpmPhase = (tick % Math.max(1, Math.round(60 / config.bpm * 60))) / Math.max(1, Math.round(60 / config.bpm * 60));

  // Drop flash
  if (signal === 'drop') _dropFlashFrames = 4;
  if (_dropFlashFrames > 0) { frame.dropFlash = true; _dropFlashFrames--; }

  _orbitAngle = (_orbitAngle + 0.5 * config.speed) % 360;

  frame.bpmPhase = bpmPhase;
  frame.signal = signal;
  frame.orbitAngle = _orbitAngle;

  switch (config.type) {
    case 'equalizer-bars':
    case 'music-mountains':
      frame.bars = makeBars(config, tick, signal, 32);
      break;

    case 'circular-spectrum':
      frame.bars = makeBars(config, tick, signal, 64);
      frame.orbitAngle = _orbitAngle;
      break;

    case 'particle-explosion':
    case 'galaxy':
    case 'star-field':
    case 'smoke-clouds':
    case 'fire':
      _particles = makeParticles(config, _particles, signal, tick);
      frame.particles = [..._particles];
      break;

    case 'waveform':
    case 'ocean-waves':
    case 'retro-lines':
    case 'sunset-grid':
      frame.terrain = makeTerrain(config, tick, signal);
      break;

    case 'water-ripple':
      _ripples = makeRipples(_ripples, signal, config, tick);
      frame.ripples = [..._ripples];
      break;

    case 'neon-grid':
    case 'tunnel':
    case 'spiral':
    case 'lightning':
    case 'city-lights':
    case 'matrix-code':
    case 'planet-orbit':
    case 'audio-terrain':
      // These use tick + bpmPhase + orbitAngle directly in the canvas renderer
      // No additional pre-computation needed at this layer
      frame.terrain = makeTerrain(config, tick, signal, 16);
      frame.bars = makeBars(config, tick, signal, 16);
      break;
  }

  return frame;
}

// ─── React signal helpers ─────────────────────────────────────────────────

/** Call when a beat tick fires (from BPM interval) */
export function reactToBeat(config: VisualizerConfig): AudioSignal {
  if (!config.reactive) return 'ambient';
  return 'beat';
}

/** Call when bass hit detected (low freq) */
export function reactToBass(config: VisualizerConfig): AudioSignal {
  if (!config.reactive) return 'ambient';
  return 'bass';
}

/** Call on snare / hi-hat */
export function reactToSnare(config: VisualizerConfig): AudioSignal {
  if (!config.reactive) return 'ambient';
  return 'snare';
}

/** Call on song drop / climax */
export function reactToDrop(config: VisualizerConfig): AudioSignal {
  _dropFlashFrames = 6;
  return 'drop';
}

/** Call when a tip event fires — amplify visualizer temporarily */
export function reactToTip(config: VisualizerConfig): VisualizerConfig {
  return { ...config, intensity: Math.min(1, config.intensity + 0.2) };
}

// ─── Config mutation helpers ──────────────────────────────────────────────

export function setVisualizerType(config: VisualizerConfig, type: VisualizerType): VisualizerConfig {
  // Reset particle / ripple state when switching types
  _particles = [];
  _ripples = [];
  return { ...config, type };
}

export function setBPM(config: VisualizerConfig, bpm: number): VisualizerConfig {
  return { ...config, bpm: Math.max(60, Math.min(240, bpm)) };
}

export function setIntensity(config: VisualizerConfig, intensity: number): VisualizerConfig {
  return { ...config, intensity: Math.max(0, Math.min(1, intensity)) };
}

export function setSpeed(config: VisualizerConfig, speed: number): VisualizerConfig {
  return { ...config, speed: Math.max(0.5, Math.min(3.0, speed)) };
}

export function applyVenuePalette(
  config: VisualizerConfig,
  primary: string,
  accent: string,
  background: string,
): VisualizerConfig {
  return { ...config, primaryColor: primary, accentColor: accent, backgroundColor: background };
}

// ─── Metadata ────────────────────────────────────────────────────────────

export interface VisualizerMeta {
  type: VisualizerType;
  label: string;
  icon: string;
  description: string;
  tags: string[];
}

export const VISUALIZER_CATALOG: VisualizerMeta[] = [
  { type: 'equalizer-bars',    label: 'EQ Bars',           icon: '📊', description: 'Classic equalizer bars pumping to the beat', tags: ['classic', 'bars', 'bpm'] },
  { type: 'waveform',          label: 'Waveform',           icon: '〰️', description: 'Oscillating sound wave line', tags: ['wave', 'oscillate'] },
  { type: 'circular-spectrum', label: 'Circular Spectrum',  icon: '🔵', description: 'Radial frequency ring — bars in a circle', tags: ['radial', 'circle', 'spectrum'] },
  { type: 'particle-explosion',label: 'Particle Burst',     icon: '✨', description: 'Particles explode outward on every beat', tags: ['particles', 'burst', 'explosive'] },
  { type: 'neon-grid',         label: 'Neon Grid',          icon: '🟦', description: 'Pulsing neon floor grid squares', tags: ['neon', 'grid', 'floor'] },
  { type: 'tunnel',            label: 'Warp Tunnel',        icon: '🕳️', description: 'Concentric rings rushing at the viewer', tags: ['tunnel', 'warp', 'immersive'] },
  { type: 'spiral',            label: 'Spiral',             icon: '🌀', description: 'Fibonacci-inspired rotating spiral', tags: ['spiral', 'rotation'] },
  { type: 'galaxy',            label: 'Galaxy',             icon: '🌌', description: 'Rotating star field with glowing core', tags: ['space', 'galaxy', 'stars'] },
  { type: 'fire',              label: 'Fire',               icon: '🔥', description: 'Bass-driven upward fire simulation', tags: ['fire', 'bass', 'energy'] },
  { type: 'water-ripple',      label: 'Water Ripple',       icon: '💧', description: 'Expanding concentric ripples on each beat', tags: ['water', 'ripple', 'calm'] },
  { type: 'lightning',         label: 'Lightning',          icon: '⚡', description: 'Random branch lightning bolts on drops', tags: ['lightning', 'electric', 'drop'] },
  { type: 'city-lights',       label: 'City Lights',        icon: '🌆', description: 'City skyline silhouette with flickering windows', tags: ['city', 'skyline', 'urban'] },
  { type: 'matrix-code',       label: 'Matrix Code',        icon: '💻', description: 'Falling green character streams', tags: ['matrix', 'code', 'digital'] },
  { type: 'retro-lines',       label: 'Retro Lines',        icon: '📺', description: 'Horizontal VHS-style scan line waves', tags: ['retro', 'vhs', '80s'] },
  { type: 'sunset-grid',       label: 'Sunset Grid',        icon: '🌅', description: '80s retrowave perspective grid horizon', tags: ['retrowave', '80s', 'sunset'] },
  { type: 'ocean-waves',       label: 'Ocean Waves',        icon: '🌊', description: 'Layered rolling sine-wave ocean', tags: ['ocean', 'wave', 'chill'] },
  { type: 'smoke-clouds',      label: 'Smoke',              icon: '💨', description: 'Drifting smoke particles', tags: ['smoke', 'ambient', 'moody'] },
  { type: 'star-field',        label: 'Star Field',         icon: '⭐', description: 'Stars zooming past at warp speed', tags: ['stars', 'space', 'warp'] },
  { type: 'planet-orbit',      label: 'Planet Orbit',       icon: '🪐', description: 'Orbiting planet system driven by BPM', tags: ['planet', 'orbit', 'cosmic'] },
  { type: 'music-mountains',   label: 'Music Mountains',    icon: '⛰️', description: 'Mountain peaks driven by beat amplitude', tags: ['mountains', 'bars', 'landscape'] },
  { type: 'audio-terrain',     label: 'Audio Terrain',      icon: '🗺️', description: 'Animated 3D-style height-map terrain mesh', tags: ['terrain', '3d', 'mesh'] },
];

export function getVisualizerMeta(type: VisualizerType): VisualizerMeta {
  return VISUALIZER_CATALOG.find(v => v.type === type) ?? VISUALIZER_CATALOG[0];
}
