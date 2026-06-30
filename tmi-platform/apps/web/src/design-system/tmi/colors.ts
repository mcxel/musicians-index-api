/**
 * TMI Design System — Color Palette
 *
 * Single source of truth for all platform colors.
 * Each feature owns a color that never changes.
 * Users learn the platform visually through color consistency.
 *
 * @see CLAUDE.md Rule 7 (Visual Design Language), Rule 18 (Visual Identity Formula)
 */

export const TMI_COLORS = {
  // Feature Colors — Canonical & Immutable
  features: {
    playlist: {
      primary: '#00ffff',      // Electric cyan
      glow: 'rgba(0, 255, 255, 0.4)',
      hover: '#00ffff',
      inactive: 'rgba(0, 255, 255, 0.4)',
      rgb: '0, 255, 255',
    },
    memoryWall: {
      primary: '#ff00ff',      // Hot magenta
      glow: 'rgba(255, 0, 255, 0.4)',
      hover: '#ff00ff',
      inactive: 'rgba(255, 0, 255, 0.4)',
      rgb: '255, 0, 255',
    },
    goLive: {
      primary: '#ff0000',      // Pure red
      glow: 'rgba(255, 0, 0, 0.4)',
      hover: '#ff0000',
      inactive: 'rgba(255, 0, 0, 0.4)',
      rgb: '255, 0, 0',
    },
    streamAndWin: {
      primary: '#9b59ff',      // Purple
      glow: 'rgba(155, 89, 255, 0.4)',
      hover: '#9b59ff',
      inactive: 'rgba(155, 89, 255, 0.4)',
      rgb: '155, 89, 255',
    },
    battles: {
      primary: '#ffd700',      // Championship gold
      glow: 'rgba(255, 215, 0, 0.4)',
      hover: '#ffd700',
      inactive: 'rgba(255, 215, 0, 0.4)',
      rgb: '255, 215, 0',
    },
    cyphers: {
      primary: '#00ff00',      // Neon lime
      glow: 'rgba(0, 255, 0, 0.4)',
      hover: '#00ff00',
      inactive: 'rgba(0, 255, 0, 0.4)',
      rgb: '0, 255, 0',
    },
    challenges: {
      primary: '#ff8800',      // Bright orange
      glow: 'rgba(255, 136, 0, 0.4)',
      hover: '#ff8800',
      inactive: 'rgba(255, 136, 0, 0.4)',
      rgb: '255, 136, 0',
    },
    dance: {
      primary: '#ff1493',      // Deep hot pink
      glow: 'rgba(255, 20, 147, 0.4)',
      hover: '#ff1493',
      inactive: 'rgba(255, 20, 147, 0.4)',
      rgb: '255, 20, 147',
    },
    messages: {
      primary: '#00dddd',      // Aqua
      glow: 'rgba(0, 221, 221, 0.4)',
      hover: '#00dddd',
      inactive: 'rgba(0, 221, 221, 0.4)',
      rgb: '0, 221, 221',
    },
    booking: {
      primary: '#4169e1',      // Royal blue
      glow: 'rgba(65, 105, 225, 0.4)',
      hover: '#4169e1',
      inactive: 'rgba(65, 105, 225, 0.4)',
      rgb: '65, 105, 225',
    },
    store: {
      primary: '#00ff88',      // Emerald green
      glow: 'rgba(0, 255, 136, 0.4)',
      hover: '#00ff88',
      inactive: 'rgba(0, 255, 136, 0.4)',
      rgb: '0, 255, 136',
    },
    revenue: {
      primary: '#ffd700',      // Gold (same as battles, premium tier)
      glow: 'rgba(255, 215, 0, 0.4)',
      hover: '#ffd700',
      inactive: 'rgba(255, 215, 0, 0.4)',
      rgb: '255, 215, 0',
    },
    sponsors: {
      primary: '#c0c0c0',      // Silver
      glow: 'rgba(192, 192, 192, 0.4)',
      hover: '#c0c0c0',
      inactive: 'rgba(192, 192, 192, 0.4)',
      rgb: '192, 192, 192',
    },
    radio: {
      primary: '#9b59ff',      // Purple (same as Stream & Win)
      glow: 'rgba(155, 89, 255, 0.4)',
      hover: '#9b59ff',
      inactive: 'rgba(155, 89, 255, 0.4)',
      rgb: '155, 89, 255',
    },
    analytics: {
      primary: '#8000ff',      // Violet
      glow: 'rgba(128, 0, 255, 0.4)',
      hover: '#8000ff',
      inactive: 'rgba(128, 0, 255, 0.4)',
      rgb: '128, 0, 255',
    },
  },

  // Neutral Palette — For UI surfaces & text
  neutral: {
    darkest: '#050510',          // Dark purple-black, hero backgrounds
    dark: '#0a0614',             // Slightly lighter, panel backgrounds
    darkGray: '#1a1a2e',         // Card backgrounds
    mediumGray: '#2a2a3e',       // Borders, dividers
    lightGray: '#aaaaaa',        // Secondary text
    white: '#ffffff',            // Primary text, highlights
  },

  // Glass & Transparency Effects
  glass: {
    darkOverlay: 'rgba(10, 6, 20, 0.95)',
    darkOverlayTransparent: 'rgba(10, 6, 20, 0.7)',
    lightOverlay: 'rgba(255, 255, 255, 0.02)',
    frosted: 'rgba(255, 255, 255, 0.05)',
  },

  // State Colors — Consistent across features
  states: {
    success: '#00ff88',
    warning: '#ff8800',
    error: '#ff0000',
    info: '#00ffff',
    disabled: '#555555',
  },
} as const;

/**
 * Get feature color by name
 * @example getFeatureColor('playlist') => { primary: '#00ffff', ... }
 */
export function getFeatureColor(feature: keyof typeof TMI_COLORS.features) {
  return TMI_COLORS.features[feature];
}

/**
 * Generate CSS glow effect for a given color
 * @example generateGlowCSS('#00ffff') => 'text-shadow: 0 0 10px #00ffff, ...'
 */
export function generateGlowCSS(color: string, intensity: 'normal' | 'hover' | 'active' = 'normal'): string {
  switch (intensity) {
    case 'normal':
      return `text-shadow: 0 0 10px ${color}, 0 0 20px ${color}33;`;
    case 'hover':
      return `text-shadow: 0 0 15px ${color}, 0 0 30px ${color}66, 0 0 45px ${color}33;`;
    case 'active':
      return `text-shadow: 0 0 20px ${color}, 0 0 40px ${color}88, 0 0 60px ${color}44;`;
    default:
      return '';
  }
}

/**
 * Extract RGB values from hex for use in rgba() functions
 * @example getRGBValues('#00ffff') => '0, 255, 255'
 */
export function getRGBValues(hexOrRGB: string): string {
  // If already in "r, g, b" format, return as-is
  if (hexOrRGB.includes(',')) {
    return hexOrRGB;
  }

  // Convert hex to RGB
  const hex = hexOrRGB.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
