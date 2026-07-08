/**
 * ThemeRuntime — scope-aware theme application across the full platform.
 *
 * One system drives visual identity for every surface:
 *   Venue     — stage, seating, curtain, broadcast monitors
 *   Dashboard — performer HQ, fan HQ, admin observatory
 *   Broadcast — Broadcast Control Deck, preview monitors
 *   Magazine  — article pages, cover layouts, discovery rails
 *   Event     — battle/cypher/challenge/game show environments
 *   Seasonal  — platform-wide overlays (New Year, Pride, Holidays, etc.)
 *
 * Scopes are layered — a seasonal override sits on top of venue, which
 * sits on top of the user's chosen base theme. Lower specificity loses.
 *
 * Usage:
 *   import { themeRuntime } from '@/lib/themes/ThemeRuntime';
 *
 *   // Apply user's chosen theme to a venue surface:
 *   themeRuntime.apply('venue', containerEl, userId);
 *
 *   // Apply a seasonal override platform-wide:
 *   themeRuntime.applySeasonalOverride('pride_2026');
 *
 *   // Read CSS variable values anywhere:
 *   themeRuntime.getVar('--tmi-accent-1'); // → '#00ffff'
 */

import {
  getTheme,
  themeToCSS,
  canUseTheme,
  type VenueThemePack,
  type VenueThemeColors,
} from '@/lib/themes/VenueThemeRegistry';

// ── Scope definition ──────────────────────────────────────────────────────────

export type ThemeScope =
  | 'venue'
  | 'dashboard'
  | 'broadcast'
  | 'magazine'
  | 'event'
  | 'seasonal';

export interface ScopedThemeOverride {
  scope: ThemeScope;
  /** Partial color overrides — unset keys fall back to the base theme */
  colors: Partial<VenueThemeColors>;
}

// ── Scope-specific defaults ────────────────────────────────────────────────────
// When a scope has no user-chosen theme, these color tweaks are applied on top
// of the base theme to differentiate the surface.

const SCOPE_OVERRIDES: Record<ThemeScope, Partial<VenueThemeColors>> = {
  venue:     {},  // base theme as-is
  dashboard: {
    bgPrimary: '#060412',
    bgSurface: '#0c0820',
  },
  broadcast: {
    accent1:   '#ff3333',
    glow:      '#ff3333',
    bgPrimary: '#080405',
    bgSurface: '#120608',
  },
  magazine: {
    accent1:   '#ffd700',
    accent2:   '#ff9900',
    glow:      '#ffd700',
    bgPrimary: '#07050e',
    bgSurface: '#100c1c',
  },
  event: {
    accent1:   '#ff00ff',
    accent2:   '#00ffff',
    glow:      '#ff00ff',
    bgPrimary: '#050010',
    bgSurface: '#0a0018',
  },
  seasonal: {},   // fully specified by seasonal pack
};

// ── Seasonal pack registry ────────────────────────────────────────────────────

export interface SeasonalThemePack {
  id: string;
  name: string;
  /** ISO date range [start, end] — runtime auto-activates/deactivates */
  activeRange?: [string, string];
  colors: Partial<VenueThemeColors>;
}

export const SEASONAL_THEME_REGISTRY: SeasonalThemePack[] = [
  {
    id: 'new_year_2027',
    name: 'New Year 2027',
    activeRange: ['2026-12-31', '2027-01-02'],
    colors: {
      accent1: '#ffd700', accent2: '#fffacd', glow: '#ffd700',
      bgPrimary: '#020208', bgSurface: '#08080e',
    },
  },
  {
    id: 'pride_2026',
    name: 'Pride 2026',
    activeRange: ['2026-06-01', '2026-06-30'],
    colors: {
      accent1: '#ff2daa', accent2: '#ffd700', accent3: '#aa2dff',
      glow: '#ff2daa', bgPrimary: '#040210', bgSurface: '#080418',
    },
  },
  {
    id: 'halloween_2026',
    name: 'Halloween 2026',
    activeRange: ['2026-10-25', '2026-11-01'],
    colors: {
      accent1: '#ff6600', accent2: '#aa2dff', glow: '#ff6600',
      bgPrimary: '#050005', bgSurface: '#0a0010',
    },
  },
  {
    id: 'summer_heat',
    name: 'Summer Heat',
    activeRange: ['2026-07-01', '2026-08-31'],
    colors: {
      accent1: '#ff4400', accent2: '#ffbb00', glow: '#ff6600',
      bgPrimary: '#060301', bgSurface: '#100804',
    },
  },
];

// ── Accessibility profiles ────────────────────────────────────────────────────

/**
 * High-contrast accessibility overrides.
 * Applied ON TOP of any base/scope/sponsor/seasonal layer.
 * Never suppressed by other layers — accessibility always wins.
 */
export interface AccessibilityProfile {
  id: 'high_contrast' | 'reduced_motion' | 'large_text';
  label: string;
  /** Color overrides for better contrast/legibility */
  colorOverrides: Partial<VenueThemeColors>;
}

export const ACCESSIBILITY_PROFILES: AccessibilityProfile[] = [
  {
    id: 'high_contrast',
    label: 'High Contrast',
    colorOverrides: {
      accent1:   '#ffffff',
      accent2:   '#ffff00',
      text:      '#ffffff',
      textMuted: '#cccccc',
      border:    'rgba(255,255,255,0.6)',
    },
  },
];

// ── Sponsor theme ─────────────────────────────────────────────────────────────

/**
 * Sponsor-injected theme for sponsored events/venues.
 * Applied above base/scope/seasonal, below accessibility.
 * Must be approved by Admin before it can be activated.
 */
export interface SponsorTheme {
  sponsorId: string;
  sponsorName: string;
  /** Only the sponsor's brand colors — partial override, not full theme */
  colors: Partial<VenueThemeColors>;
  /** Which scope this sponsor theme affects */
  scope: ThemeScope;
}

// ── Storage key prefix ────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'tmi_theme_';

// ── Priority layer order (highest wins) ────────────────────────────────────────
//
//   1. Accessibility  ← always on top, cannot be suppressed
//   2. Emergency      ← system alert state (platform outage, safety notice, DMCA hold)
//   3. Seasonal       ← date-triggered platform overlay
//   4. Sponsor        ← brand injection for sponsored event/venue
//   5. Scope          ← surface-type color adjustment (broadcast = red, magazine = gold)
//   6. User Base      ← user's chosen theme pack
//

export interface EmergencyTheme {
  reason: 'outage' | 'safety' | 'dmca' | 'maintenance';
  label: string;
  colors: Partial<VenueThemeColors>;
}

// Red/amber system-state palette for emergency overrides
const EMERGENCY_COLORS: Record<EmergencyTheme['reason'], Partial<VenueThemeColors>> = {
  outage:      { accent1: '#ff2222', accent2: '#ff6600', glow: '#ff2222', bgPrimary: '#100000', bgSurface: '#180000' },
  safety:      { accent1: '#ff9900', accent2: '#ffcc00', glow: '#ff9900', bgPrimary: '#0a0600', bgSurface: '#150a00' },
  dmca:        { accent1: '#888888', accent2: '#aaaaaa', glow: '#888888', bgPrimary: '#080808', bgSurface: '#101010' },
  maintenance: { accent1: '#00ccff', accent2: '#0088ff', glow: '#00ccff', bgPrimary: '#000a10', bgSurface: '#001520' },
};

// ── Runtime class ─────────────────────────────────────────────────────────────

class ThemeRuntimeEngine {
  private static _instance: ThemeRuntimeEngine;
  private _baseThemeId: string = 'tmi_default';
  private _seasonalId: string | null = null;
  private _sponsorTheme: SponsorTheme | null = null;
  private _accessibilityId: AccessibilityProfile['id'] | null = null;
  private _emergencyTheme: EmergencyTheme | null = null;

  static getInstance(): ThemeRuntimeEngine {
    if (!this._instance) this._instance = new ThemeRuntimeEngine();
    return this._instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this._baseThemeId = localStorage.getItem(`${STORAGE_PREFIX}base`) ?? 'tmi_default';
      this._accessibilityId = (localStorage.getItem(`${STORAGE_PREFIX}a11y`) as AccessibilityProfile['id'] | null);
      this._detectSeasonalOverride();
    }
  }

  // ── Base theme application ──────────────────────────────────────────────────

  /**
   * Apply the full priority-layered theme to a DOM element (or :root).
   * Layer order: Base → Scope → Sponsor → Seasonal → Accessibility
   */
  apply(
    scope: ThemeScope,
    target: HTMLElement | null,
    unlockedPacks: string[] = [],
    memberTier = 'FREE',
  ): void {
    const theme = getTheme(this._baseThemeId);
    if (!theme) return;

    const el = target ?? document.documentElement;

    // Layer 1: Base + scope adjustment
    let colors: VenueThemeColors = this._mergeColors(theme.colors, scope);

    // Layer 2: Sponsor override (if active for this scope)
    if (this._sponsorTheme?.scope === scope) {
      colors = { ...colors, ...this._sponsorTheme.colors };
    }

    // Layer 3: Seasonal
    if (this._seasonalId) {
      const seasonal = SEASONAL_THEME_REGISTRY.find(s => s.id === this._seasonalId);
      if (seasonal) colors = { ...colors, ...seasonal.colors };
    }

    // Layer 4: Emergency (system-state override — outage, DMCA, maintenance)
    if (this._emergencyTheme) {
      const emergencyBase = EMERGENCY_COLORS[this._emergencyTheme.reason];
      colors = { ...colors, ...emergencyBase, ...this._emergencyTheme.colors };
    }

    // Layer 5: Accessibility (always last — cannot be overridden)
    if (this._accessibilityId) {
      const a11y = ACCESSIBILITY_PROFILES.find(p => p.id === this._accessibilityId);
      if (a11y) colors = { ...colors, ...a11y.colorOverrides };
    }

    const props = themeToCSS(colors);
    for (const [prop, value] of Object.entries(props)) {
      el.style.setProperty(prop, value);
    }

    void unlockedPacks;
    void memberTier;
  }

  /** Set the user's chosen base theme. Persists to localStorage. */
  setBaseTheme(
    themeId: string,
    unlockedPacks: string[] = [],
    memberTier = 'FREE',
  ): boolean {
    if (!canUseTheme(themeId, unlockedPacks, memberTier)) return false;
    this._baseThemeId = themeId;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_PREFIX}base`, themeId);
    }
    return true;
  }

  get baseThemeId(): string { return this._baseThemeId; }
  get baseTheme(): VenueThemePack | undefined { return getTheme(this._baseThemeId); }

  // ── Seasonal overrides ──────────────────────────────────────────────────────

  /** Manually activate a seasonal theme pack (admin or timed trigger). */
  applySeasonalOverride(seasonalId: string): void {
    this._seasonalId = seasonalId;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_PREFIX}seasonal`, seasonalId);
    }
  }

  clearSeasonalOverride(): void {
    this._seasonalId = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${STORAGE_PREFIX}seasonal`);
    }
  }

  get activeSeasonalId(): string | null { return this._seasonalId; }

  // ── Sponsor theme ───────────────────────────────────────────────────────────

  /**
   * Inject a sponsor's brand colors into a specific scope.
   * Must be called by Admin (from Sponsor Campaign engine) — not by users.
   */
  applySponsorTheme(theme: SponsorTheme): void {
    this._sponsorTheme = theme;
  }

  clearSponsorTheme(): void {
    this._sponsorTheme = null;
  }

  get activeSponsorTheme(): SponsorTheme | null { return this._sponsorTheme; }

  // ── Emergency override ──────────────────────────────────────────────────────

  /**
   * Activate an emergency system-state theme. Admin-only.
   * Overrides sponsor and seasonal. Yields only to accessibility.
   */
  setEmergencyTheme(theme: EmergencyTheme | null): void {
    this._emergencyTheme = theme;
  }

  get activeEmergencyTheme(): EmergencyTheme | null { return this._emergencyTheme; }

  // ── Accessibility ───────────────────────────────────────────────────────────

  /** Activate an accessibility profile. Persists to localStorage. Always wins in layering. */
  setAccessibilityProfile(id: AccessibilityProfile['id'] | null): void {
    this._accessibilityId = id;
    if (typeof window !== 'undefined') {
      if (id) localStorage.setItem(`${STORAGE_PREFIX}a11y`, id);
      else localStorage.removeItem(`${STORAGE_PREFIX}a11y`);
    }
  }

  get activeAccessibilityId(): AccessibilityProfile['id'] | null { return this._accessibilityId; }

  /** Auto-detect if today falls in a seasonal active range. */
  private _detectSeasonalOverride(): void {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}seasonal`);
    const today = new Date().toISOString().slice(0, 10);
    const autoMatch = SEASONAL_THEME_REGISTRY.find(s =>
      s.activeRange && today >= s.activeRange[0] && today <= s.activeRange[1]
    );
    this._seasonalId = autoMatch?.id ?? stored ?? null;
  }

  // ── CSS variable reader ─────────────────────────────────────────────────────

  /** Read a resolved CSS custom property from :root. */
  getVar(prop: string, fallback = ''): string {
    if (typeof window === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(prop).trim() || fallback;
  }

  // ── Color merge ─────────────────────────────────────────────────────────────

  private _mergeColors(
    base: VenueThemeColors,
    scope: ThemeScope,
  ): VenueThemeColors {
    const override = SCOPE_OVERRIDES[scope];
    return { ...base, ...override };
  }
}

export const themeRuntime = ThemeRuntimeEngine.getInstance();
