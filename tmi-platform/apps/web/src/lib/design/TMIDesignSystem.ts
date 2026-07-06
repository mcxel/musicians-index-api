/**
 * TMI-OS Design System — the single source of truth for all visual tokens.
 *
 * Visual Direction Lock v2.0 (2026-06-30):
 * Every component, page, and shell inherits from here.
 * No page introduces its own visual language.
 */

// ── Core Palette ──────────────────────────────────────────────────────────────

export const TMI_COLORS = {
  // Accent families
  cyan:     '#00FFFF',
  fuchsia:  '#FF2DAA',
  purple:   '#AA2DFF',
  gold:     '#FFD700',
  lime:     '#00FF88',
  orange:   '#FF6B35',
  red:      '#FF2020',
  redDeep:  '#E63000',

  // Backgrounds
  bgBase:   '#030310',
  bgSurface: '#05050f',
  bgGlass:  'rgba(5,5,22,0.88)',
  bgGlassLight: 'rgba(255,255,255,0.04)',

  // Text
  textPrimary:   '#ffffff',
  textSecondary: 'rgba(255,255,255,0.65)',
  textMuted:     'rgba(255,255,255,0.35)',
  textDim:       'rgba(255,255,255,0.18)',

  // Borders
  borderSubtle:  'rgba(255,255,255,0.06)',
  borderNormal:  'rgba(255,255,255,0.12)',
  borderStrong:  'rgba(255,255,255,0.22)',
} as const;

// ── Per-Page Identity ─────────────────────────────────────────────────────────
// Each home/surface has a primary accent that drives its glow, borders, and highlights.

export const PAGE_ACCENTS = {
  'home-1':         TMI_COLORS.cyan,      // Discovery / Crown
  'home-1-2':       TMI_COLORS.fuchsia,   // Billboard
  'home-2':         TMI_COLORS.gold,      // Magazine
  'home-3':         '#FF2020',            // Live (urgent red)
  'home-4':         TMI_COLORS.lime,      // Marketplace
  'home-5':         TMI_COLORS.purple,    // Arena
  'performer-hub':  TMI_COLORS.purple,
  'fan-hub':        TMI_COLORS.cyan,
  'venue-hub':      TMI_COLORS.fuchsia,
  'sponsor-hub':    TMI_COLORS.gold,
  'live-room':      TMI_COLORS.cyan,
  'battle-room':    TMI_COLORS.fuchsia,
  'cypher-room':    TMI_COLORS.purple,
  'magazine':       TMI_COLORS.gold,
  'admin':          TMI_COLORS.orange,
} as const;

export type PageKey = keyof typeof PAGE_ACCENTS;

export function getPageAccent(page: PageKey): string {
  return PAGE_ACCENTS[page] ?? TMI_COLORS.cyan;
}

// ── Glass System ──────────────────────────────────────────────────────────────

export function glassPanel(accentColor = TMI_COLORS.purple, intensity: 'subtle' | 'normal' | 'strong' = 'normal') {
  const glowMap = { subtle: '0.08', normal: '0.14', strong: '0.25' };
  const glow = glowMap[intensity];
  return {
    background: TMI_COLORS.bgGlass,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${TMI_COLORS.borderSubtle}`,
    borderRadius: 14,
    boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${accentColor}${Math.round(parseFloat(glow) * 255).toString(16).padStart(2,'0')}`,
  } as React.CSSProperties;
}

export function glassCard(accentColor = TMI_COLORS.purple) {
  return {
    ...glassPanel(accentColor, 'normal'),
    borderRadius: 18,
    padding: '32px 28px',
  } as React.CSSProperties;
}

export function glassButton(accentColor = TMI_COLORS.cyan, active = false) {
  return {
    background: active ? `${accentColor}22` : TMI_COLORS.bgGlassLight,
    border: `1px solid ${active ? accentColor + '55' : TMI_COLORS.borderNormal}`,
    color: active ? accentColor : TMI_COLORS.textSecondary,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } as React.CSSProperties;
}

// ── Glow Utilities ────────────────────────────────────────────────────────────

export function accentGlow(color: string, intensity: number = 0.3) {
  return `0 0 ${Math.round(intensity * 80)}px ${color}${Math.round(intensity * 100).toString(16).padStart(2,'0')}`;
}

export function accentBg(color: string, opacity = 0.08) {
  const hex = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `radial-gradient(ellipse at 50% 0%, ${color}${hex} 0%, transparent 65%)`;
}

// ── Typography Scale ──────────────────────────────────────────────────────────

export const TMI_TYPE = {
  // Display — magazine covers, concert headers
  display:    { fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.05 },
  // Heading
  h1:         { fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, letterSpacing: '-0.01em' },
  h2:         { fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 800, letterSpacing: '-0.01em' },
  h3:         { fontSize: 16, fontWeight: 700 },
  // Body
  body:       { fontSize: 14, fontWeight: 400, lineHeight: 1.6 },
  bodySmall:  { fontSize: 12, fontWeight: 400, lineHeight: 1.5 },
  // Labels
  label:      { fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' as const },
  labelMd:    { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const },
  // Live / urgent
  live:       { fontSize: 8, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' as const },
} as const;

// ── Animation Timing ──────────────────────────────────────────────────────────

export const TMI_SPRING = {
  snappy:  { type: 'spring', stiffness: 400, damping: 32 } as const,
  normal:  { type: 'spring', stiffness: 300, damping: 30 } as const,
  gentle:  { type: 'spring', stiffness: 200, damping: 28 } as const,
  drawer:  { type: 'spring', stiffness: 280, damping: 32 } as const,
  card:    { type: 'spring', stiffness: 340, damping: 28 } as const,
};

export const TMI_EASE = {
  panel:   [0.32, 0, 0.67, 0] as [number,number,number,number],
  reveal:  [0.16, 1, 0.3, 1] as [number,number,number,number],
  subtle:  [0.4, 0, 0.2, 1] as [number,number,number,number],
};

// ── Idle Monitor Graphics ─────────────────────────────────────────────────────
// When a video panel has no active feed, show a branded idle state — NOT a black box.

export function idleMonitorStyle(accentColor = TMI_COLORS.cyan) {
  return {
    background: `radial-gradient(ellipse at 50% 50%, ${accentColor}0a 0%, #08080f 65%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };
}

// ── React type import ─────────────────────────────────────────────────────────
import type React from 'react';
