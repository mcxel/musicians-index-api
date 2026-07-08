/**
 * MagazineThemeEngine.ts
 *
 * Resolver layer between content context and ThemeManifest.
 * The article never picks its own theme — it passes context here
 * and receives a complete ThemeManifest back.
 *
 * Resolution priority (first match wins):
 *   1. Explicit themeId override (performer/editor has chosen one)
 *   2. Special edition override
 *   3. Issue theme mapping
 *   4. Genre + tier heuristic
 *   5. TMI default
 *
 * v1: deterministic rules only.
 * v3: AI recommendation layer plugs in as an optional step between 3 and 4.
 */

import { THEME_REGISTRY, getTheme, type ThemeManifest } from './ThemeRegistry';

// ── CSS variable map ──────────────────────────────────────────────────────────
// Maps ThemeManifest fields → CSS custom property names.
// Components use `var(--tmi-mag-*)` with fallbacks to their own defaults.

export function manifestToCssVars(m: ThemeManifest): Record<string, string> {
  return {
    // Typography
    '--tmi-mag-font-display':      m.typography.fontDisplay,
    '--tmi-mag-font-body':         m.typography.fontBody,
    '--tmi-mag-font-accent':       m.typography.fontAccent,
    '--tmi-mag-weight-display':    String(m.typography.weightDisplay),
    '--tmi-mag-weight-body':       String(m.typography.weightBody),
    '--tmi-mag-letter-spacing':    m.typography.letterSpacing,
    '--tmi-mag-text-transform':    m.typography.textTransform,
    '--tmi-mag-line-height':       m.typography.lineHeight,

    // Palette
    '--tmi-mag-bg':                m.palette.background,
    '--tmi-mag-surface':           m.palette.surface,
    '--tmi-mag-surface-alt':       m.palette.surfaceAlt,
    '--tmi-mag-accent':            m.palette.accent,
    '--tmi-mag-accent-alt':        m.palette.accentAlt,
    '--tmi-mag-text':              m.palette.text,
    '--tmi-mag-text-muted':        m.palette.textMuted,
    '--tmi-mag-border':            m.palette.border,
    '--tmi-mag-overlay':           m.palette.overlay,
    '--tmi-mag-ink':               m.palette.ink,

    // Frame
    '--tmi-mag-radius':            m.frame.radius,
    '--tmi-mag-border-width':      m.frame.borderWidth,
    '--tmi-mag-border-style':      m.frame.borderStyle,
    '--tmi-mag-shadow':            m.frame.shadow,

    // FX
    '--tmi-mag-bg-texture':        m.fx.backgroundTexture,
    '--tmi-mag-noise':             String(m.fx.noiseOpacity),
    '--tmi-mag-glow':              m.fx.glowColor,
    '--tmi-mag-glow-intensity':    String(m.fx.glowIntensity),
    '--tmi-mag-particle-color':    m.fx.particleColor,
    '--tmi-mag-particle-opacity':  String(m.fx.particleOpacity),
    '--tmi-mag-blend':             m.fx.overlayBlend,
    '--tmi-mag-paper':             m.fx.paperStyle,

    // Motion
    '--tmi-mag-reveal-dur':        m.motion.revealDuration,
    '--tmi-mag-reveal-ease':       m.motion.revealEasing,
    '--tmi-mag-transition':        m.motion.transitionSpeed,
    '--tmi-mag-sweep-opacity':     String(m.motion.sweepOpacity),

    // Buttons
    '--tmi-mag-btn-radius':        m.buttons.radius,
    '--tmi-mag-btn-weight':        String(m.buttons.fontWeight),
    '--tmi-mag-btn-spacing':       m.buttons.letterSpacing,

    // Badges
    '--tmi-mag-badge-radius':      m.badges.radius,
    '--tmi-mag-badge-border':      m.badges.borderWeight,
  };
}

/** Converts the CSS var map to an inline React style object */
export function manifestToInlineStyle(m: ThemeManifest): React.CSSProperties {
  return manifestToCssVars(m) as React.CSSProperties;
}

// ── Resolve context ───────────────────────────────────────────────────────────

export interface ThemeResolveContext {
  /** Performer's explicit theme choice (overrides everything else) */
  themeId?: string;
  /** Special edition key e.g. "Hall of Fame 2026" */
  specialEdition?: string;
  /** Magazine issue slug e.g. "summer-2026" */
  issue?: string;
  /** Performer tier — used for heuristic match */
  performerTier?: string;
  /** Genre — used for heuristic match */
  genre?: string;
  /** Mood hint from image analysis (v3 AI assistant) */
  mood?: string;
}

// ── Issue → theme mapping ─────────────────────────────────────────────────────
const ISSUE_THEME_MAP: Record<string, string> = {
  'new-beginnings':     'modern-luxury',
  'winter-edition':     'heritage-editorial',
  'festival-season':    'concert-night',
  'summer-heat':        'neon-future',
  'awards-season':      'award-night',
  'halloween':          'concert-night',
  'hall-of-fame':       'hall-of-fame',
  'black-music-month':  'street-energy',
  'latin-spotlight':    'pop-collage',
  'holiday-edition':    'award-night',
  'year-in-review':     'hall-of-fame',
  'world-tour':         'concert-night',
  'indie-spotlight':    'retro-zine',
};

// ── Genre → theme heuristic ───────────────────────────────────────────────────
const GENRE_THEME_MAP: Record<string, string> = {
  'Hip-Hop':      'street-energy',
  'Rap':          'street-energy',
  'R&B':          'modern-luxury',
  'Soul':         'heritage-editorial',
  'Gospel':       'heritage-editorial',
  'Jazz':         'heritage-editorial',
  'Blues':        'retro-zine',
  'Pop':          'pop-collage',
  'Rock':         'retro-zine',
  'Metal':        'retro-zine',
  'Country':      'retro-zine',
  'Indie':        'retro-zine',
  'EDM':          'neon-future',
  'Electronic':   'neon-future',
  'Dance Crews':  'pop-collage',
  'Latin':        'pop-collage',
  'Reggae':       'concert-night',
  'Dancehall':    'concert-night',
  'Afrobeats':    'concert-night',
  'Funk':         'street-energy',
  'Comedy':       'pop-collage',
};

// ── Special edition overrides ─────────────────────────────────────────────────
const SPECIAL_EDITION_MAP: Record<string, string> = {
  'Hall of Fame':        'hall-of-fame',
  'Diamond Feature':     'hall-of-fame',
  'World Championship':  'award-night',
  'Anniversary Edition': 'heritage-editorial',
  'Debut Feature':       'modern-luxury',
};

// ── Tier → default theme fallback ─────────────────────────────────────────────
const TIER_DEFAULT_MAP: Record<string, string> = {
  FREE:      'tmi-default',
  PRO:       'tmi-default',
  RUBY:      'heritage-editorial',
  Silver:    'concert-night',
  Gold:      'modern-luxury',
  Platinum:  'award-night',
  Diamond:   'hall-of-fame',
};

// ── Main resolver ─────────────────────────────────────────────────────────────

export function resolveTheme(ctx: ThemeResolveContext): ThemeManifest {
  // 1. Explicit performer/editor choice
  if (ctx.themeId && THEME_REGISTRY[ctx.themeId]) {
    return getTheme(ctx.themeId);
  }

  // 2. Special edition
  if (ctx.specialEdition) {
    const key = Object.keys(SPECIAL_EDITION_MAP).find((k) =>
      ctx.specialEdition!.toLowerCase().includes(k.toLowerCase())
    );
    if (key) return getTheme(SPECIAL_EDITION_MAP[key]);
  }

  // 3. Issue theme
  if (ctx.issue) {
    const normalized = ctx.issue.toLowerCase().replace(/\s+/g, '-');
    const key = Object.keys(ISSUE_THEME_MAP).find((k) => normalized.includes(k));
    if (key) return getTheme(ISSUE_THEME_MAP[key]);
  }

  // 4. Genre heuristic
  if (ctx.genre && GENRE_THEME_MAP[ctx.genre]) {
    return getTheme(GENRE_THEME_MAP[ctx.genre]);
  }

  // 5. Tier default
  if (ctx.performerTier && TIER_DEFAULT_MAP[ctx.performerTier]) {
    return getTheme(TIER_DEFAULT_MAP[ctx.performerTier]);
  }

  // 6. Platform default
  return getTheme('tmi-default');
}

// Re-export for convenience
export { getTheme, getAllThemeIds, getAccessibleThemes } from './ThemeRegistry';
export type { ThemeManifest } from './ThemeRegistry';

// React import for manifestToInlineStyle type
import type React from 'react';
