/**
 * TMI Observatory Design Tokens
 *
 * Unified token system for Admin, Performer, and Fan Observatories.
 * Shared structure (spacing, typography, elevations, motion) + role-specific variants.
 *
 * @see CLAUDE.md Rule 7 (Visual Design Language)
 * @see CLAUDE.md Rule 18 (Visual Identity Formula)
 */

import { HOMEPAGE_COLORS, HOMEPAGE_TYPOGRAPHY, HOMEPAGE_SPACING, HOMEPAGE_GLOW, HOMEPAGE_RADIUS } from '@/lib/homepage/design-tokens';

/**
 * SHARED TOKENS (All Observatories inherit)
 * Structure, layout, and motion rules that don't change between Admin/Performer/Fan
 */
export const OBSERVATORY_SHARED_TOKENS = {
  // Spacing scale (inherited from homepage)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  } as const,

  // Typography scale
  typography: {
    display: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: '1.2',
      fontFamily: HOMEPAGE_TYPOGRAPHY.display,
    },
    heading: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: '1.3',
      fontFamily: HOMEPAGE_TYPOGRAPHY.display,
    },
    subheading: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '1.4',
      fontFamily: HOMEPAGE_TYPOGRAPHY.body,
    },
    body: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.5',
      fontFamily: HOMEPAGE_TYPOGRAPHY.body,
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '1.4',
      fontFamily: HOMEPAGE_TYPOGRAPHY.body,
    },
    data: {
      fontSize: '13px',
      fontWeight: 500,
      lineHeight: '1.4',
      fontFamily: HOMEPAGE_TYPOGRAPHY.data,
    },
  } as const,

  // Elevations (shadow depths)
  elevations: {
    surface: 'box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
    raised: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
    floating: 'box-shadow: 0 8px 24px rgba(0,0,0,0.2);',
    modal: 'box-shadow: 0 12px 40px rgba(0,0,0,0.3);',
  } as const,

  // Motion/animation durations
  motion: {
    instant: '0ms',
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    entrance: '350ms cubic-bezier(0.34, 1.56, 0.64, 1)', // bouncy
  } as const,

  // Border radius scale
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '999px',
  } as const,

  // Layout constraints
  layout: {
    headerHeight: '64px',
    dockHeight: '80px',
    railMinWidth: '280px',
    railMaxWidth: '360px',
    centerMinWidth: '600px',
    monitorAspectRatio: '16 / 9',
  } as const,

  // Z-index stack
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    overlay: 1000,
    modal: 1200,
    tooltip: 1500,
  } as const,

  // Backdrop filter (glass effect)
  backdrop: {
    light: 'backdrop-filter: blur(6px);',
    normal: 'backdrop-filter: blur(10px);',
    strong: 'backdrop-filter: blur(16px);',
  } as const,
} as const;

/**
 * ROLE VARIANTS
 * Visual identity for each role (Admin, Performer, Fan)
 * Overrides only: colors, glow, accent intensity
 */
export const OBSERVATORY_ROLE_VARIANTS = {
  ADMIN_GOLD: {
    // Primary accent
    accentColor: '#ffd700',
    accentColorRgb: '255, 215, 0',

    // Frame and border
    frameColor: '#b8860b',
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderColorHover: 'rgba(255, 215, 0, 0.5)',

    // Glow and light
    glowColor: 'rgba(255, 215, 0, 0.5)',
    glowIntense: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)',
    glowSubtle: '0 0 12px rgba(255, 215, 0, 0.3)',

    // Background
    backgroundColor: 'rgba(5, 5, 16, 0.95)',
    panelBackground: 'rgba(10, 6, 20, 0.85)',
    cardBackground: 'rgba(15, 8, 25, 0.8)',

    // Text
    textColor: '#ffffff',
    textMuted: '#b8b8c8',

    // Status indicators
    activeColor: '#ffd700',
    warningColor: '#ff6b6b',
    successColor: '#00ff88',
    errorColor: '#ff4444',

    // Lighting intensity
    lightingIntensity: 'high',
  } as const,

  PERFORMER_NEON: {
    // Primary accent
    accentColor: '#ff00ff',
    accentColorRgb: '255, 0, 255',

    // Frame and border
    frameColor: '#00ffff',
    borderColor: 'rgba(0, 255, 255, 0.2)',
    borderColorHover: 'rgba(0, 255, 255, 0.4)',

    // Glow and light
    glowColor: 'rgba(255, 0, 255, 0.4)',
    glowIntense: '0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)',
    glowSubtle: '0 0 12px rgba(255, 0, 255, 0.25)',

    // Background
    backgroundColor: 'rgba(10, 6, 20, 0.9)',
    panelBackground: 'rgba(15, 8, 28, 0.85)',
    cardBackground: 'rgba(20, 10, 30, 0.8)',

    // Text
    textColor: '#ffffff',
    textMuted: '#aaaacc',

    // Status indicators
    activeColor: '#ff00ff',
    warningColor: '#ff8844',
    successColor: '#00ff88',
    errorColor: '#ff4444',

    // Lighting intensity
    lightingIntensity: 'medium',
  } as const,

  FAN_NEON: {
    // Primary accent
    accentColor: '#00ffff',
    accentColorRgb: '0, 255, 255',

    // Frame and border
    frameColor: '#ff00ff',
    borderColor: 'rgba(255, 0, 255, 0.15)',
    borderColorHover: 'rgba(255, 0, 255, 0.35)',

    // Glow and light
    glowColor: 'rgba(0, 255, 255, 0.3)',
    glowIntense: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.25)',
    glowSubtle: '0 0 12px rgba(0, 255, 255, 0.2)',

    // Background
    backgroundColor: 'rgba(10, 6, 20, 0.9)',
    panelBackground: 'rgba(15, 8, 28, 0.85)',
    cardBackground: 'rgba(20, 10, 30, 0.8)',

    // Text
    textColor: '#ffffff',
    textMuted: '#aaaacc',

    // Status indicators
    activeColor: '#00ffff',
    warningColor: '#ff8844',
    successColor: '#00ff88',
    errorColor: '#ff4444',

    // Lighting intensity
    lightingIntensity: 'medium',
  } as const,
} as const;

/**
 * Type for role variants
 */
export type ObservatoryRole = keyof typeof OBSERVATORY_ROLE_VARIANTS;

/**
 * Component-specific token combinations
 */
export const OBSERVATORY_COMPONENTS = {
  card: {
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    padding: '16px',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    borderWidth: '1px',
  } as const,

  panel: {
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    padding: '20px',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    borderWidth: '1px',
  } as const,

  monitor: {
    borderRadius: '8px',
    aspectRatio: '16 / 9',
    objectFit: 'contain', // never stretch
    borderWidth: '2px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as const,

  dock: {
    height: '80px',
    borderRadius: '0',
    backdropFilter: 'blur(8px)',
    borderWidth: '1px',
    borderPosition: 'top',
  } as const,

  button: {
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    borderWidth: '1px',
  } as const,

  overlay: {
    borderRadius: '12px',
    backdropFilter: 'blur(12px)',
    borderWidth: '1px',
    padding: '24px',
    zIndex: 1200,
  } as const,
} as const;

/**
 * Utility function to get complete token set for a role
 * @example const tokens = getObservatoryTokens('ADMIN_GOLD');
 */
export function getObservatoryTokens(role: ObservatoryRole) {
  return {
    shared: OBSERVATORY_SHARED_TOKENS,
    variant: OBSERVATORY_ROLE_VARIANTS[role],
    components: OBSERVATORY_COMPONENTS,
  } as const;
}

/**
 * Utility to build a CSS custom properties map for a role
 * Usage: Apply to :root or a container element
 */
export function getCSSVariablesForRole(role: ObservatoryRole): Record<string, string> {
  const variant = OBSERVATORY_ROLE_VARIANTS[role];
  const shared = OBSERVATORY_SHARED_TOKENS;

  return {
    // Accent colors
    '--accent-color': variant.accentColor,
    '--accent-color-rgb': variant.accentColorRgb,
    '--frame-color': variant.frameColor,
    '--border-color': variant.borderColor,
    '--border-color-hover': variant.borderColorHover,

    // Glow
    '--glow-color': variant.glowColor,
    '--glow-intense': variant.glowIntense,
    '--glow-subtle': variant.glowSubtle,

    // Background
    '--bg-primary': variant.backgroundColor,
    '--bg-panel': variant.panelBackground,
    '--bg-card': variant.cardBackground,

    // Text
    '--text-primary': variant.textColor,
    '--text-muted': variant.textMuted,

    // Status
    '--status-active': variant.activeColor,
    '--status-warning': variant.warningColor,
    '--status-success': variant.successColor,
    '--status-error': variant.errorColor,

    // Spacing
    '--spacing-xs': shared.spacing.xs,
    '--spacing-sm': shared.spacing.sm,
    '--spacing-md': shared.spacing.md,
    '--spacing-lg': shared.spacing.lg,
    '--spacing-xl': shared.spacing.xl,

    // Motion
    '--motion-fast': shared.motion.fast,
    '--motion-normal': shared.motion.normal,
    '--motion-slow': shared.motion.slow,

    // Layout
    '--header-height': shared.layout.headerHeight,
    '--dock-height': shared.layout.dockHeight,
  };
}

/**
 * Build inline style object for a specific component in a role
 * @example const cardStyle = getComponentStyle('card', 'ADMIN_GOLD');
 */
export function getComponentStyle(component: keyof typeof OBSERVATORY_COMPONENTS, role: ObservatoryRole): Record<string, string | undefined> {
  const tokens = getObservatoryTokens(role);
  const comp = tokens.components[component] as any;
  const variant = tokens.variant;

  return {
    borderRadius: comp.borderRadius,
    backdropFilter: comp.backdropFilter || undefined,
    padding: comp.padding || undefined,
    borderWidth: comp.borderWidth,
    borderColor: variant.borderColor,
    backgroundColor: component === 'monitor' ? comp.backgroundColor : variant.panelBackground,
    transition: comp.transition || undefined,
    aspectRatio: comp.aspectRatio || undefined,
    objectFit: comp.objectFit || undefined,
  };
}

export default {
  shared: OBSERVATORY_SHARED_TOKENS,
  variants: OBSERVATORY_ROLE_VARIANTS,
  components: OBSERVATORY_COMPONENTS,
  getTokens: getObservatoryTokens,
  getCSSVariables: getCSSVariablesForRole,
  getComponentStyle,
};
