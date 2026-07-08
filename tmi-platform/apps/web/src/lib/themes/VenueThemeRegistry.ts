/**
 * VenueThemeRegistry — purchasable + free color packs for venues and dashboards.
 *
 * Each pack changes: accent neons, background depth, glow color, and surface tints.
 * Applied as CSS custom properties via VenueThemeProvider.
 *
 * Tier model (per Rule 19 Store Role Split):
 *   'free'    — every account gets these on signup
 *   'premium' — purchased from the Performer Store or Fan Store
 *   'tier'    — unlocked by reaching a membership tier (Silver/Gold/Platinum/Diamond)
 *
 * Revenue hook: premium packs are $0.99–$4.99 in the store. The purchase flow
 * sets `unlockedPacks` in the user's profile; this registry gates `canUse()`.
 *
 * Usage:
 *   import { VENUE_THEME_REGISTRY, getTheme } from '@/lib/themes/VenueThemeRegistry';
 */

export type ThemeTier = 'free' | 'premium' | 'tier_silver' | 'tier_gold' | 'tier_platinum' | 'tier_diamond';

export interface VenueThemeColors {
  /** Primary neon — CTAs, highlights, glow */
  accent1: string;
  /** Secondary neon — secondary highlights, drawer orbs */
  accent2: string;
  /** Tertiary accent — badges, crowns */
  accent3: string;
  /** Deep background for venue/dashboard body */
  bgPrimary: string;
  /** Surface background for cards, panels, drawers */
  bgSurface: string;
  /** Glass tint for frosted surfaces */
  bgGlass: string;
  /** Dominant glow color for bloom effects */
  glow: string;
  /** Primary text color */
  text: string;
  /** Muted text color */
  textMuted: string;
  /** Border / separator color */
  border: string;
}

export interface VenueThemePack {
  id: string;
  name: string;
  description: string;
  tier: ThemeTier;
  /** USD price for premium packs. Null for free/tier-unlocked. */
  price?: number;
  /** Points cost for points-purchase packs. */
  pointsCost?: number;
  colors: VenueThemeColors;
  /** Preview gradient string for the theme picker swatch */
  swatch: string;
}

// ── Theme definitions ──────────────────────────────────────────────────────────

export const VENUE_THEME_REGISTRY: VenueThemePack[] = [
  // ── FREE ──────────────────────────────────────────────────────────────────

  {
    id: 'tmi_default',
    name: 'TMI Classic',
    description: 'The signature dark space palette. Cyan + fuchsia + gold.',
    tier: 'free',
    colors: {
      accent1:   '#00ffff',
      accent2:   '#ff00ff',
      accent3:   '#ffd700',
      bgPrimary: '#050510',
      bgSurface: '#0a0618',
      bgGlass:   'rgba(10, 6, 24, 0.72)',
      glow:      '#00ffff',
      text:      '#ffffff',
      textMuted: '#8899aa',
      border:    'rgba(0,255,255,0.15)',
    },
    swatch: 'linear-gradient(135deg, #050510 0%, #00ffff22 50%, #ff00ff22 100%)',
  },

  {
    id: 'tmi_dark',
    name: 'Midnight Black',
    description: 'Pure black with subtle violet accents. Maximum depth.',
    tier: 'free',
    colors: {
      accent1:   '#aa2dff',
      accent2:   '#6622cc',
      accent3:   '#cc88ff',
      bgPrimary: '#000000',
      bgSurface: '#0d0010',
      bgGlass:   'rgba(13, 0, 16, 0.75)',
      glow:      '#aa2dff',
      text:      '#eeeeee',
      textMuted: '#665577',
      border:    'rgba(170,45,255,0.18)',
    },
    swatch: 'linear-gradient(135deg, #000000 0%, #aa2dff22 60%, #6622cc22 100%)',
  },

  {
    id: 'tmi_neon',
    name: 'Full Neon',
    description: 'Maximum brightness. Every color at full saturation.',
    tier: 'free',
    colors: {
      accent1:   '#00ffff',
      accent2:   '#ff2daa',
      accent3:   '#aaff00',
      bgPrimary: '#040814',
      bgSurface: '#080d1e',
      bgGlass:   'rgba(8, 13, 30, 0.7)',
      glow:      '#00ffff',
      text:      '#ffffff',
      textMuted: '#7799bb',
      border:    'rgba(0,255,255,0.2)',
    },
    swatch: 'linear-gradient(135deg, #04081488 0%, #00ffff44 40%, #ff2daa44 70%, #aaff0033 100%)',
  },

  // ── TIER UNLOCKS ──────────────────────────────────────────────────────────

  {
    id: 'chrome',
    name: 'Chrome Silver',
    description: 'Sleek silver and electric blue. Unlocked at Silver tier.',
    tier: 'tier_silver',
    colors: {
      accent1:   '#00ccff',
      accent2:   '#aaccee',
      accent3:   '#ffffff',
      bgPrimary: '#06080e',
      bgSurface: '#0e1118',
      bgGlass:   'rgba(14, 17, 24, 0.74)',
      glow:      '#00ccff',
      text:      '#ddeeff',
      textMuted: '#667788',
      border:    'rgba(0, 200, 255, 0.18)',
    },
    swatch: 'linear-gradient(135deg, #06080e 0%, #00ccff22 50%, #aaccee22 100%)',
  },

  {
    id: 'vice_neon',
    name: 'Vice City',
    description: 'Hot pink and electric cyan. Unlocked at Gold tier.',
    tier: 'tier_gold',
    colors: {
      accent1:   '#ff2daa',
      accent2:   '#00eeff',
      accent3:   '#ffcc00',
      bgPrimary: '#080410',
      bgSurface: '#110618',
      bgGlass:   'rgba(17, 6, 24, 0.73)',
      glow:      '#ff2daa',
      text:      '#ffddee',
      textMuted: '#885566',
      border:    'rgba(255,45,170,0.2)',
    },
    swatch: 'linear-gradient(135deg, #080410 0%, #ff2daa33 45%, #00eeff33 100%)',
  },

  {
    id: 'broadcast',
    name: 'Broadcast Red',
    description: 'Live television energy. Unlocked at Platinum tier.',
    tier: 'tier_platinum',
    colors: {
      accent1:   '#ff3333',
      accent2:   '#ff8800',
      accent3:   '#ffffff',
      bgPrimary: '#0a0505',
      bgSurface: '#160808',
      bgGlass:   'rgba(22, 8, 8, 0.74)',
      glow:      '#ff3333',
      text:      '#ffeeee',
      textMuted: '#885555',
      border:    'rgba(255,51,51,0.2)',
    },
    swatch: 'linear-gradient(135deg, #0a0505 0%, #ff333333 50%, #ff880022 100%)',
  },

  {
    id: 'signature',
    name: 'Diamond Black',
    description: 'Exclusive black and pure gold. Only for Diamond members.',
    tier: 'tier_diamond',
    colors: {
      accent1:   '#ffd700',
      accent2:   '#ffaa00',
      accent3:   '#ffffff',
      bgPrimary: '#020202',
      bgSurface: '#0a0800',
      bgGlass:   'rgba(10, 8, 0, 0.76)',
      glow:      '#ffd700',
      text:      '#fff8e0',
      textMuted: '#887733',
      border:    'rgba(255,215,0,0.22)',
    },
    swatch: 'linear-gradient(135deg, #020202 0%, #ffd70033 50%, #ffaa0022 100%)',
  },

  // ── PREMIUM (purchasable) ─────────────────────────────────────────────────

  {
    id: 'emerald',
    name: 'Emerald City',
    description: 'Deep green neon. Lush and exclusive.',
    tier: 'premium',
    price: 0.99,
    colors: {
      accent1:   '#00ff88',
      accent2:   '#00cc55',
      accent3:   '#aaffcc',
      bgPrimary: '#030d08',
      bgSurface: '#061410',
      bgGlass:   'rgba(6, 20, 16, 0.73)',
      glow:      '#00ff88',
      text:      '#ccffee',
      textMuted: '#448855',
      border:    'rgba(0,255,136,0.18)',
    },
    swatch: 'linear-gradient(135deg, #030d08 0%, #00ff8833 50%, #00cc5522 100%)',
  },

  {
    id: 'solar_flare',
    name: 'Solar Flare',
    description: 'Burning orange and deep red. Arena energy.',
    tier: 'premium',
    price: 0.99,
    colors: {
      accent1:   '#ff6600',
      accent2:   '#ff2200',
      accent3:   '#ffbb44',
      bgPrimary: '#0a0400',
      bgSurface: '#150800',
      bgGlass:   'rgba(21, 8, 0, 0.73)',
      glow:      '#ff6600',
      text:      '#fff0e0',
      textMuted: '#885533',
      border:    'rgba(255,102,0,0.2)',
    },
    swatch: 'linear-gradient(135deg, #0a0400 0%, #ff660033 45%, #ff220022 100%)',
  },

  {
    id: 'galaxy',
    name: 'Galaxy',
    description: 'Deep space indigo with star-field shimmer.',
    tier: 'premium',
    price: 1.99,
    colors: {
      accent1:   '#8866ff',
      accent2:   '#4433cc',
      accent3:   '#ccbbff',
      bgPrimary: '#04020e',
      bgSurface: '#0a0618',
      bgGlass:   'rgba(10, 6, 24, 0.74)',
      glow:      '#8866ff',
      text:      '#ddd8ff',
      textMuted: '#554488',
      border:    'rgba(136,102,255,0.2)',
    },
    swatch: 'linear-gradient(135deg, #04020e 0%, #8866ff33 50%, #4433cc22 100%)',
  },

  {
    id: 'cherry_blossom',
    name: 'Cherry Blossom',
    description: 'Soft pink and warm gold. Elegant and vibrant.',
    tier: 'premium',
    price: 1.99,
    colors: {
      accent1:   '#ff88bb',
      accent2:   '#ffaabb',
      accent3:   '#ffddcc',
      bgPrimary: '#0d0408',
      bgSurface: '#180810',
      bgGlass:   'rgba(24, 8, 16, 0.73)',
      glow:      '#ff88bb',
      text:      '#ffeeee',
      textMuted: '#885566',
      border:    'rgba(255,136,187,0.2)',
    },
    swatch: 'linear-gradient(135deg, #0d0408 0%, #ff88bb33 50%, #ffaabb22 100%)',
  },

  {
    id: 'arctic',
    name: 'Arctic',
    description: 'Icy blue-white. Clean, cold, sharp.',
    tier: 'premium',
    price: 2.99,
    colors: {
      accent1:   '#aaeeff',
      accent2:   '#66ccff',
      accent3:   '#ffffff',
      bgPrimary: '#030810',
      bgSurface: '#080f1e',
      bgGlass:   'rgba(8, 15, 30, 0.74)',
      glow:      '#aaeeff',
      text:      '#eef8ff',
      textMuted: '#5577aa',
      border:    'rgba(170,238,255,0.2)',
    },
    swatch: 'linear-gradient(135deg, #030810 0%, #aaeeff33 50%, #66ccff22 100%)',
  },

  {
    id: 'royale',
    name: 'Royale',
    description: 'Deep purple and crowned gold. Supreme elegance.',
    tier: 'premium',
    price: 3.99,
    colors: {
      accent1:   '#cc44ff',
      accent2:   '#ffd700',
      accent3:   '#eeccff',
      bgPrimary: '#060010',
      bgSurface: '#0d0020',
      bgGlass:   'rgba(13, 0, 32, 0.75)',
      glow:      '#cc44ff',
      text:      '#f0e8ff',
      textMuted: '#664488',
      border:    'rgba(204,68,255,0.22)',
    },
    swatch: 'linear-gradient(135deg, #060010 0%, #cc44ff33 45%, #ffd70033 100%)',
  },
];

// ── Public API ─────────────────────────────────────────────────────────────────

const _index = new Map(VENUE_THEME_REGISTRY.map(t => [t.id, t]));

export function getTheme(id: string): VenueThemePack | undefined {
  return _index.get(id);
}

export function getFreeThemes(): VenueThemePack[] {
  return VENUE_THEME_REGISTRY.filter(t => t.tier === 'free');
}

export function getPremiumThemes(): VenueThemePack[] {
  return VENUE_THEME_REGISTRY.filter(t => t.tier === 'premium');
}

export function getTierThemes(): VenueThemePack[] {
  return VENUE_THEME_REGISTRY.filter(t => t.tier.startsWith('tier_'));
}

/** Check if a user with the given unlocked pack IDs can use a theme. */
export function canUseTheme(themeId: string, unlockedPacks: string[], memberTier: string): boolean {
  const theme = _index.get(themeId);
  if (!theme) return false;
  if (theme.tier === 'free') return true;
  if (theme.tier === 'premium') return unlockedPacks.includes(themeId);
  // Tier-based unlocks — check hierarchy
  const TIER_ORDER = ['FREE', 'PRO', 'RUBY', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const requiredTier = theme.tier.replace('tier_', '').toUpperCase();
  const userTierIdx = TIER_ORDER.indexOf(memberTier.toUpperCase());
  const reqTierIdx  = TIER_ORDER.indexOf(requiredTier);
  return userTierIdx >= reqTierIdx;
}

/** Convert a theme's colors to CSS custom properties object. */
export function themeToCSS(colors: VenueThemeColors): Record<string, string> {
  return {
    '--tmi-accent-1':    colors.accent1,
    '--tmi-accent-2':    colors.accent2,
    '--tmi-accent-3':    colors.accent3,
    '--tmi-bg-primary':  colors.bgPrimary,
    '--tmi-bg-surface':  colors.bgSurface,
    '--tmi-bg-glass':    colors.bgGlass,
    '--tmi-glow':        colors.glow,
    '--tmi-text':        colors.text,
    '--tmi-text-muted':  colors.textMuted,
    '--tmi-border':      colors.border,
  };
}
