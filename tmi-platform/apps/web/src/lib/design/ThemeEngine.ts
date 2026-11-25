'use client';

/**
 * ThemeEngine — runtime that distributes visual identity tokens to every surface.
 *
 * Philosophy: a theme is a complete visual identity (nav, drawer, particles,
 * live room HUD, video panels, profiles, venues) — not just a color.
 *
 * Usage:
 *   // Apply a theme
 *   ThemeEngine.apply('inferno');
 *
 *   // Read current tokens
 *   const { primary, secondary, accentGlow } = ThemeEngine.getTokens();
 *
 *   // React hook
 *   const theme = useTheme();
 */

import {
  DEFAULT_PERSONAL_UI_THEME,
  loadPersonalUiThemePrefs,
  projectPersonalUiThemeToCss,
  savePersonalUiThemePrefs,
  type PersonalUiThemePrefs,
} from '@/lib/design/PersonalUiThemeAuthority';

// ── Theme definitions ──────────────────────────────────────────────────────────

/** Complete environment package — not just a color, an entire room identity */
export interface ThemeTokens {
  // Identity
  id:            string;
  name:          string;
  description?:  string;
  tier:          'free' | 'premium' | 'limited' | 'seasonal' | 'artist' | 'venue';
  unlockCriteria?: string; // "purchase" | "achievement:xxx" | "tier:diamond"
  creatorId?:    string;   // artist/venue owner for custom packs
  previewUrl?:   string;   // thumbnail for Theme Store

  // Core palette
  primary:       string;   // dominant accent (nav, badges, XP bar)
  secondary:     string;   // supporting accent (cards, borders)
  tertiary:      string;   // highlight accent (gold, premium)
  bgBase:        string;   // page background
  bgSurface:     string;   // card/panel background
  bgGlass:       string;   // glassmorphism background

  // Lighting system
  glowColor:     string;   // ambient/glow color
  glowIntensity: number;   // 0–1 multiplier
  stageLight?:   string;   // venue stage wash color
  crowdLight?:   string;   // audience area light
  rimLight?:     string;   // video panel rim lighting

  // Ambient visualizer — complete behavior spec
  particleShapes:   string[];  // shape rotation
  particleColors:   string[];  // color palette
  particleSpeed:    number;    // 0.5 slow → 2.0 fast
  particleDensity:  number;    // 0.3 sparse → 1.5 dense
  beatReactivity:   number;    // 0 none → 1.5 extreme
  spawnPattern:     'rise' | 'scatter' | 'orbit' | 'rain' | 'pulse';
  fadeStyle:        'fade' | 'shrink' | 'drift' | 'explode';
  drawerGlow:       string;    // bottom drawer glow color

  // Glass system overrides
  glassBlur?:    number;   // default 20px, theme can override
  glassOpacity?: number;   // default 0.88

  // Motion character
  transitionStyle:  'smooth' | 'snappy' | 'dramatic' | 'minimal';
  motionSpeed:      number;   // 0.5 slow → 2.0 fast

  // Monitor / video panel identity
  monitorBorderColor?: string;
  monitorIdleStyle?:   'branded' | 'ambient' | 'dark';

  // Broadcast / overlay (for live rooms and venues)
  broadcastAccent?: string;
  broadcastOverlay?: string; // URL to overlay image/CSS

  // Optional pack extensions (modular — add without rewriting)
  particlePack?:  string;  // ID of loadable particle extension
  soundCueId?:    string;  // optional UI sound profile ID
}

export const THEME_CATALOG: Record<string, ThemeTokens> = {
  'neon-royal': {
    id: 'neon-royal', name: 'Neon Royal', description: 'The TMI signature. Glass, violet, and electric cyan.',
    tier: 'free',
    primary: '#AA2DFF', secondary: '#00FFFF', tertiary: '#FFD700',
    bgBase: '#030310', bgSurface: '#05050f', bgGlass: 'rgba(5,5,22,0.88)',
    glowColor: '#AA2DFF', glowIntensity: 0.7, stageLight: '#AA2DFF', crowdLight: '#00FFFF',
    particleShapes: ['orb','disc','music-note','star','orb','diamond'],
    particleColors: ['#AA2DFF','#00FFFF','#FFD700','#FF2DAA'],
    particleSpeed: 1, particleDensity: 1, beatReactivity: 1,
    spawnPattern: 'rise', fadeStyle: 'fade',
    drawerGlow: '#AA2DFF', transitionStyle: 'smooth', motionSpeed: 1,
    monitorBorderColor: '#AA2DFF', monitorIdleStyle: 'ambient',
  },
  'inferno': {
    id: 'inferno', name: 'Inferno', description: 'Crimson heat. Fire streaks, ember glow, gold sparks.',
    tier: 'premium', unlockCriteria: 'purchase',
    primary: '#E63000', secondary: '#FF6B35', tertiary: '#FFD700',
    bgBase: '#0a0500', bgSurface: '#120800', bgGlass: 'rgba(18,8,0,0.9)',
    glowColor: '#FF4500', glowIntensity: 0.9, stageLight: '#FF4500', crowdLight: '#FF6B35',
    particleShapes: ['lightning','star','orb','money','crown','star'],
    particleColors: ['#E63000','#FF6B35','#FFD700','#FF2020'],
    particleSpeed: 1.6, particleDensity: 1.3, beatReactivity: 1.4,
    spawnPattern: 'scatter', fadeStyle: 'explode',
    drawerGlow: '#FF4500', transitionStyle: 'dramatic', motionSpeed: 1.4,
    monitorBorderColor: '#E63000', monitorIdleStyle: 'ambient',
  },
  'electric-ocean': {
    id: 'electric-ocean', name: 'Electric Ocean', description: 'Deep aqua energy. Waves, vinyl, floating notes.',
    tier: 'premium', unlockCriteria: 'purchase',
    primary: '#00FFFF', secondary: '#0080FF', tertiary: '#FFFFFF',
    bgBase: '#000a0f', bgSurface: '#001020', bgGlass: 'rgba(0,10,20,0.9)',
    glowColor: '#00FFFF', glowIntensity: 0.8, stageLight: '#0080FF', crowdLight: '#00FFFF',
    particleShapes: ['wave','disc','music-note','orb','wave','star'],
    particleColors: ['#00FFFF','#0080FF','#FFFFFF','#00FF88'],
    particleSpeed: 0.8, particleDensity: 0.9, beatReactivity: 0.8,
    spawnPattern: 'orbit', fadeStyle: 'drift',
    drawerGlow: '#00FFFF', transitionStyle: 'smooth', motionSpeed: 0.85,
    monitorBorderColor: '#00FFFF', monitorIdleStyle: 'ambient',
  },
  'emerald-empire': {
    id: 'emerald-empire', name: 'Emerald Empire', description: 'Luxury green. Crystal particles, golden wealth.',
    tier: 'premium', unlockCriteria: 'purchase',
    primary: '#00FF88', secondary: '#00C070', tertiary: '#FFD700',
    bgBase: '#000d06', bgSurface: '#001509', bgGlass: 'rgba(0,13,6,0.9)',
    glowColor: '#00FF88', glowIntensity: 0.75, stageLight: '#00C070', crowdLight: '#FFD700',
    particleShapes: ['diamond','star','orb','crown','money','diamond'],
    particleColors: ['#00FF88','#00C070','#FFD700','#00FFFF'],
    particleSpeed: 0.9, particleDensity: 1, beatReactivity: 0.9,
    spawnPattern: 'rise', fadeStyle: 'shrink',
    drawerGlow: '#00FF88', transitionStyle: 'smooth', motionSpeed: 0.9,
    monitorBorderColor: '#00FF88', monitorIdleStyle: 'branded',
  },
  'sunset-boulevard': {
    id: 'sunset-boulevard', name: 'Sunset Boulevard', description: 'Warm pink sky. Hearts, stars, soft glow.',
    tier: 'premium', unlockCriteria: 'purchase',
    primary: '#FF6B35', secondary: '#FF2DAA', tertiary: '#AA2DFF',
    bgBase: '#0a0005', bgSurface: '#150008', bgGlass: 'rgba(15,0,8,0.9)',
    glowColor: '#FF6B35', glowIntensity: 0.7, stageLight: '#FF2DAA', crowdLight: '#FF6B35',
    particleShapes: ['star','heart','orb','music-note','star','lightning'],
    particleColors: ['#FF6B35','#FF2DAA','#AA2DFF','#FFD700'],
    particleSpeed: 1.1, particleDensity: 1.1, beatReactivity: 1.0,
    spawnPattern: 'scatter', fadeStyle: 'fade',
    drawerGlow: '#FF6B35', transitionStyle: 'smooth', motionSpeed: 1.05,
    monitorBorderColor: '#FF6B35', monitorIdleStyle: 'ambient',
  },
  'midnight-noir': {
    id: 'midnight-noir', name: 'Midnight Noir', description: 'Clean minimal. Premium broadcast look, silver precision.',
    tier: 'premium', unlockCriteria: 'purchase',
    primary: '#C0C0C0', secondary: '#FFFFFF', tertiary: '#888888',
    bgBase: '#000000', bgSurface: '#080808', bgGlass: 'rgba(8,8,8,0.92)',
    glowColor: '#FFFFFF', glowIntensity: 0.4, stageLight: '#C0C0C0', crowdLight: '#FFFFFF',
    particleShapes: ['orb','diamond','star','orb','wave','orb'],
    particleColors: ['#C0C0C0','#FFFFFF','#888888','#AAAAAA'],
    particleSpeed: 0.6, particleDensity: 0.6, beatReactivity: 0.5,
    spawnPattern: 'pulse', fadeStyle: 'fade',
    drawerGlow: '#C0C0C0', transitionStyle: 'minimal', motionSpeed: 0.7,
    monitorBorderColor: '#C0C0C0', monitorIdleStyle: 'dark',
  },
  'diamond-elite': {
    id: 'diamond-elite', name: 'Diamond Elite', description: 'Ice and silver. For Diamond tier members only.',
    tier: 'limited', unlockCriteria: 'tier:diamond',
    primary: '#B0E0FF', secondary: '#C0C0C0', tertiary: '#FFFFFF',
    bgBase: '#000510', bgSurface: '#000a18', bgGlass: 'rgba(0,5,16,0.92)',
    glowColor: '#B0E0FF', glowIntensity: 0.95, stageLight: '#B0E0FF', crowdLight: '#FFFFFF',
    particleShapes: ['diamond','star','crown','diamond','orb','diamond'],
    particleColors: ['#B0E0FF','#C0C0C0','#FFFFFF','#8080FF'],
    particleSpeed: 0.7, particleDensity: 1.2, beatReactivity: 0.8,
    spawnPattern: 'rain', fadeStyle: 'shrink',
    drawerGlow: '#B0E0FF', transitionStyle: 'dramatic', motionSpeed: 0.75,
    monitorBorderColor: '#B0E0FF', monitorIdleStyle: 'branded',
  },
  /** Personal Theme Studio free presets — full workspace (not header-only). */
  'pure-black': {
    id: 'pure-black', name: 'Pure Black', description: 'All-black workspace. Pair with white or gray buttons.',
    tier: 'free',
    primary: '#FFFFFF', secondary: '#C0C0C0', tertiary: '#888888',
    bgBase: '#000000', bgSurface: '#0a0a0a', bgGlass: 'rgba(0,0,0,0.92)',
    glowColor: '#FFFFFF', glowIntensity: 0.25, stageLight: '#333333', crowdLight: '#FFFFFF',
    particleShapes: ['orb','orb','orb'],
    particleColors: ['#FFFFFF','#888888','#444444'],
    particleSpeed: 0.4, particleDensity: 0.35, beatReactivity: 0.3,
    spawnPattern: 'pulse', fadeStyle: 'fade',
    drawerGlow: '#FFFFFF', transitionStyle: 'minimal', motionSpeed: 0.7,
    monitorBorderColor: '#FFFFFF', monitorIdleStyle: 'dark',
  },
  'pure-white': {
    id: 'pure-white', name: 'Pure White', description: 'All-white workspace. Pair with black or gray buttons.',
    tier: 'free',
    primary: '#111111', secondary: '#333333', tertiary: '#666666',
    bgBase: '#FFFFFF', bgSurface: '#F4F4F6', bgGlass: 'rgba(255,255,255,0.92)',
    glowColor: '#111111', glowIntensity: 0.15, stageLight: '#DDDDDD', crowdLight: '#111111',
    particleShapes: ['orb','orb'],
    particleColors: ['#CCCCCC','#999999'],
    particleSpeed: 0.4, particleDensity: 0.25, beatReactivity: 0.2,
    spawnPattern: 'pulse', fadeStyle: 'fade',
    drawerGlow: '#111111', transitionStyle: 'minimal', motionSpeed: 0.7,
    monitorBorderColor: '#111111', monitorIdleStyle: 'branded',
  },
  'monochrome': {
    id: 'monochrome', name: 'Monochrome', description: 'Black, white, and gray only — no neon forced.',
    tier: 'free',
    primary: '#E8E8E8', secondary: '#9A9A9A', tertiary: '#5A5A5A',
    bgBase: '#121212', bgSurface: '#1c1c1c', bgGlass: 'rgba(18,18,18,0.92)',
    glowColor: '#E8E8E8', glowIntensity: 0.3, stageLight: '#444444', crowdLight: '#E8E8E8',
    particleShapes: ['orb','diamond','orb'],
    particleColors: ['#E8E8E8','#9A9A9A','#5A5A5A'],
    particleSpeed: 0.5, particleDensity: 0.45, beatReactivity: 0.35,
    spawnPattern: 'pulse', fadeStyle: 'fade',
    drawerGlow: '#E8E8E8', transitionStyle: 'minimal', motionSpeed: 0.75,
    monitorBorderColor: '#9A9A9A', monitorIdleStyle: 'dark',
  },
  'custom-color': {
    id: 'custom-color', name: 'Custom Color', description: 'Your HEX palette for workspace + accents (buttons independent).',
    tier: 'free',
    primary: '#AA2DFF', secondary: '#00FFFF', tertiary: '#FFD700',
    bgBase: '#030310', bgSurface: '#05050f', bgGlass: 'rgba(5,5,22,0.88)',
    glowColor: '#AA2DFF', glowIntensity: 0.55, stageLight: '#AA2DFF', crowdLight: '#00FFFF',
    particleShapes: ['orb','disc','star'],
    particleColors: ['#AA2DFF','#00FFFF','#FFD700'],
    particleSpeed: 0.9, particleDensity: 0.8, beatReactivity: 0.8,
    spawnPattern: 'rise', fadeStyle: 'fade',
    drawerGlow: '#AA2DFF', transitionStyle: 'smooth', motionSpeed: 1,
    monitorBorderColor: '#AA2DFF', monitorIdleStyle: 'ambient',
  },
} satisfies Record<string, ThemeTokens>;

// ── Scene → shape profile mapping ────────────────────────────────────────────

export type VisualScene =
  | 'playlist'     | 'tips-received'  | 'ranking'
  | 'celebration'  | 'battle'         | 'chill-lobby'
  | 'money-wall'   | 'memory-wall'    | 'season-pass'
  | 'default';

export const SCENE_SHAPES: Record<VisualScene, string[]> = {
  'playlist':      ['disc','music-note','wave','orb','disc'],
  'tips-received': ['money','diamond','star','money','star'],
  'ranking':       ['crown','star','diamond','crown'],
  'celebration':   ['heart','star','orb','heart','star'],
  'battle':        ['lightning','crown','star','lightning'],
  'chill-lobby':   ['orb','wave','orb','disc','orb'],
  'money-wall':    ['money','diamond','money','star','diamond'],
  'memory-wall':   ['heart','star','orb','heart'],
  'season-pass':   ['crown','diamond','star','crown'],
  'default':       ['orb','disc','music-note','star','orb','diamond'],
};

// ── Device performance detection ──────────────────────────────────────────────

export type DeviceTier = 'high' | 'mid' | 'low';

function detectDeviceTier(): DeviceTier {
  if (typeof navigator === 'undefined') return 'high';
  // Check hardware concurrency (CPU cores) as proxy for device capability
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores >= 8) return 'high';
  if (cores >= 4) return 'mid';
  return 'low';
}

/** Apply device-appropriate scale to particle density and motion.
 *  qualityOverride: 'auto' uses device detection; others are explicit user choices.
 */
export function scaleForDevice(
  tokens: ThemeTokens,
  tierOrQuality?: DeviceTier | 'auto' | 'high' | 'balanced' | 'performance'
): ThemeTokens {
  const input = tierOrQuality ?? detectDeviceTier();
  // Map quality names to device tiers
  const tier: DeviceTier =
    input === 'high'        ? 'high'
    : input === 'balanced'  ? 'mid'
    : input === 'performance' ? 'low'
    : input === 'auto'      ? detectDeviceTier()
    : input as DeviceTier;

  if (tier === 'high') return tokens;
  const factor = tier === 'mid' ? 0.65 : 0.35;
  return {
    ...tokens,
    particleDensity: (tokens.particleDensity ?? 1) * factor,
    beatReactivity:  (tokens.beatReactivity ?? 1) * factor,
    glowIntensity:   (tokens.glowIntensity ?? 0.7) * (tier === 'mid' ? 0.8 : 0.5),
  };
}

// ── Runtime state ──────────────────────────────────────────────────────────────

const THEME_KEY = 'tmi.theme.active.v1';
const listeners = new Set<(t: ThemeTokens) => void>();

let _activeId: string = 'neon-royal';
let _activeScene: VisualScene = 'default';
let _personalPrefs: PersonalUiThemePrefs = { ...DEFAULT_PERSONAL_UI_THEME };

function _load(): void {
  if (typeof window === 'undefined') return;
  try { _activeId = localStorage.getItem(THEME_KEY) ?? 'neon-royal'; } catch { /* ignore */ }
  _personalPrefs = loadPersonalUiThemePrefs();
  if (_personalPrefs.catalogThemeId && THEME_CATALOG[_personalPrefs.catalogThemeId]) {
    _activeId = _personalPrefs.catalogThemeId;
  }
}
_load();

function _projectCss(): void {
  if (typeof document === 'undefined') return;
  projectPersonalUiThemeToCss(ThemeEngine.getTokens(), _personalPrefs);
}

function _emit(): void {
  const tokens = ThemeEngine.getTokens();
  _projectCss();
  for (const l of listeners) try { l(tokens); } catch { /* silent */ }
}

// ── ThemeEngine public API ────────────────────────────────────────────────────

export const ThemeEngine = {
  /** Get active theme tokens, scene-shape-overridden and device-scaled */
  getTokens(overrideScene?: VisualScene, deviceTier?: DeviceTier): ThemeTokens {
    const base = THEME_CATALOG[_activeId] ?? THEME_CATALOG['neon-royal']!;
    const scene = overrideScene ?? _activeScene;
    const sceneShapes = SCENE_SHAPES[scene];
    const withScene: ThemeTokens = { ...base, particleShapes: sceneShapes ?? base.particleShapes };
    return scaleForDevice(withScene, deviceTier);
  },

  /** Return owned theme IDs (from localStorage, updated on purchase) */
  getOwnedIds(): string[] {
    try {
      const raw = localStorage.getItem('tmi.theme.owned.v1') ?? '[]';
      const ids = JSON.parse(raw) as string[];
      // Free personalization presets always available
      return [
        'neon-royal',
        'pure-black',
        'pure-white',
        'monochrome',
        'custom-color',
        'midnight-noir',
        ...ids,
      ];
    } catch {
      return ['neon-royal', 'pure-black', 'pure-white', 'monochrome', 'custom-color', 'midnight-noir'];
    }
  },

  /** Mark a theme as owned (called from store purchase flow) */
  unlock(themeId: string): void {
    const owned = new Set(ThemeEngine.getOwnedIds());
    owned.add(themeId);
    try { localStorage.setItem('tmi.theme.owned.v1', JSON.stringify([...owned])); } catch { /* ignore */ }
    _emit();
  },

  /** Apply a catalog theme + project CSS chrome tokens (no media remount). */
  apply(themeId: string): void {
    if (!THEME_CATALOG[themeId]) return;
    _activeId = themeId;
    _personalPrefs = { ..._personalPrefs, catalogThemeId: themeId };
    try { localStorage.setItem(THEME_KEY, themeId); } catch { /* ignore */ }
    savePersonalUiThemePrefs(_personalPrefs);
    _emit();
  },

  getPersonalPrefs(): PersonalUiThemePrefs {
    return { ..._personalPrefs, sectionOverrides: { ..._personalPrefs.sectionOverrides } };
  },

  setPersonalPrefs(patch: Partial<PersonalUiThemePrefs>): void {
    _personalPrefs = {
      ..._personalPrefs,
      ...patch,
      sectionOverrides: {
        ..._personalPrefs.sectionOverrides,
        ...(patch.sectionOverrides ?? {}),
      },
    };
    if (patch.catalogThemeId && THEME_CATALOG[patch.catalogThemeId]) {
      _activeId = patch.catalogThemeId;
      try { localStorage.setItem(THEME_KEY, _activeId); } catch { /* ignore */ }
    }
    savePersonalUiThemePrefs(_personalPrefs);
    _emit();
  },

  hydrateCss(): void {
    _projectCss();
  },

  resetToTmiOriginal(): void {
    _personalPrefs = { ...DEFAULT_PERSONAL_UI_THEME };
    _activeId = 'neon-royal';
    try { localStorage.setItem(THEME_KEY, 'neon-royal'); } catch { /* ignore */ }
    savePersonalUiThemePrefs(_personalPrefs);
    _emit();
  },

  /** Set the current visual scene (changes shape rotation immediately) */
  setScene(scene: VisualScene): void {
    _activeScene = scene;
    _emit();
  },

  getActiveId(): string { return _activeId; },
  getScene(): VisualScene { return _activeScene; },
  getCatalog(): Record<string, ThemeTokens> { return THEME_CATALOG; },

  subscribe(listener: (t: ThemeTokens) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Register a custom theme (artist/venue packs purchased from store) */
  registerCustomTheme(theme: ThemeTokens): void {
    (THEME_CATALOG as Record<string, ThemeTokens>)[theme.id] = theme;
  },
};

// ── React hook ────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

export function useTheme(sceneOverride?: VisualScene): ThemeTokens {
  const [tokens, setTokens] = useState<ThemeTokens>(() => ThemeEngine.getTokens(sceneOverride));

  useEffect(() => {
    setTokens(ThemeEngine.getTokens(sceneOverride));
    return ThemeEngine.subscribe((t) => setTokens({ ...t, particleShapes: SCENE_SHAPES[sceneOverride ?? ThemeEngine.getScene()] ?? t.particleShapes }));
  }, [sceneOverride]);

  return tokens;
}
