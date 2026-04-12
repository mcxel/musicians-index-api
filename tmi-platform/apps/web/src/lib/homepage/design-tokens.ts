export const HOMEPAGE_COLORS = {
  voidBlack: '#050510',
  studioObsidian: '#0b1020',
  neonCyan: '#00d4ff',
  magentaPulse: '#ff2daa',
  signalGold: '#f9c74f',
  electricPurple: '#9b5de5',
  warmAlert: '#ff6b6b',
  coolMint: '#7ef7c9',
  textPrimary: '#eef2ff',
  textMuted: '#9aa3b2',
} as const;

export const HOMEPAGE_TYPOGRAPHY = {
  display: '"Oswald", "Anton", "Arial Narrow", sans-serif',
  body: '"Inter", "Segoe UI", sans-serif',
  data: '"JetBrains Mono", "Consolas", monospace',
} as const;

export const HOMEPAGE_SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  belt: 48,
  beltWide: 64,
} as const;

export const HOMEPAGE_GLOW = {
  cyan: '0 0 0 1px rgba(0,212,255,0.3), 0 0 36px rgba(0,212,255,0.2)',
  pink: '0 0 0 1px rgba(255,45,170,0.3), 0 0 36px rgba(255,45,170,0.18)',
  gold: '0 0 0 1px rgba(249,199,79,0.28), 0 0 34px rgba(249,199,79,0.16)',
} as const;

export const HOMEPAGE_RADIUS = {
  card: 16,
  belt: 18,
  chip: 999,
} as const;
