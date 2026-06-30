/**
 * TMI Design System — Spacing Tokens
 *
 * Consistent spacing scale for padding, margins, gaps, and layouts.
 * Based on 8px base unit (aligns with most design systems).
 *
 * @see CLAUDE.md Rule 18 (Visual Identity Formula)
 */

export const TMI_SPACING = {
  // Base Unit: 8px
  px: '1px',
  0.5: '4px',    // half-unit
  1: '8px',      // base unit
  1.5: '12px',   // 1.5x
  2: '16px',     // 2x
  2.5: '20px',   // 2.5x
  3: '24px',     // 3x
  3.5: '28px',   // 3.5x
  4: '32px',     // 4x
  5: '40px',     // 5x
  6: '48px',     // 6x
  7: '56px',     // 7x
  8: '64px',     // 8x
  10: '80px',    // 10x
  12: '96px',    // 12x
  14: '112px',   // 14x
  16: '128px',   // 16x
  20: '160px',   // 20x
  24: '192px',   // 24x

  // Semantic Naming
  xs: '4px',     // extra small
  sm: '8px',     // small
  md: '16px',    // medium (default padding)
  lg: '24px',    // large
  xl: '32px',    // extra large
  '2xl': '48px', // 2x large
  '3xl': '64px', // 3x large

  // Component-Specific Spacing
  button: {
    padX: '16px',
    padY: '8px',
    gap: '6px',
    borderRadius: '6px',
  },

  panel: {
    padding: '16px',
    gap: '12px',
    borderRadius: '8px',
  },

  card: {
    padding: '20px',
    gap: '12px',
    borderRadius: '8px',
  },

  modal: {
    padding: '24px',
    gap: '16px',
    borderRadius: '12px',
  },

  input: {
    padX: '12px',
    padY: '8px',
    borderRadius: '4px',
  },

  tab: {
    padding: '12px 16px',
    gap: '8px',
    borderRadius: '6px',
  },

  // Layout Spacing
  layout: {
    navigationRailCollapsed: '72px',
    navigationRailExpanded: '240px',
    sidePanel: '320px',
    bottomPanel: '120px',
    topBar: '64px',
  },

  // Responsive Breakpoints
  breakpoints: {
    mobile: '360px',
    tablet: '768px',
    desktop: '1024px',
    ultrawide: '1920px',
  },
} as const;

/**
 * Get spacing value
 * @example getSpacing('md') => '16px'
 */
export function getSpacing(size: keyof typeof TMI_SPACING): string {
  const value = TMI_SPACING[size];
  return typeof value === 'string' ? value : '16px';
}

/**
 * Create padding shorthand
 * @example getPadding('md') => '16px'
 * @example getPadding('md', 'lg') => '16px 24px'
 * @example getPadding('md', 'lg', 'sm', 'xl') => '16px 24px 8px 32px'
 */
export function getPadding(
  top: keyof typeof TMI_SPACING,
  right?: keyof typeof TMI_SPACING,
  bottom?: keyof typeof TMI_SPACING,
  left?: keyof typeof TMI_SPACING,
): string {
  const topVal = getSpacing(top);
  const rightVal = right ? getSpacing(right) : topVal;
  const bottomVal = bottom ? getSpacing(bottom) : topVal;
  const leftVal = left ? getSpacing(left) : rightVal;

  return `${topVal} ${rightVal} ${bottomVal} ${leftVal}`;
}

/**
 * Create margin shorthand
 */
export function getMargin(
  top: keyof typeof TMI_SPACING,
  right?: keyof typeof TMI_SPACING,
  bottom?: keyof typeof TMI_SPACING,
  left?: keyof typeof TMI_SPACING,
): string {
  return getPadding(top, right, bottom, left);
}

/**
 * Get grid gap
 * @example getGap('md') => '16px'
 */
export function getGap(size: keyof typeof TMI_SPACING): string {
  return getSpacing(size);
}

/**
 * Get responsive spacing value (scales for mobile/tablet/desktop)
 * @example getResponsiveSpacing('mobile', 'md', 'lg', 'xl')
 */
export function getResponsiveSpacing(
  breakpoint: 'mobile' | 'tablet' | 'desktop',
  mobileSize: keyof typeof TMI_SPACING,
  tabletSize?: keyof typeof TMI_SPACING,
  desktopSize?: keyof typeof TMI_SPACING,
): React.CSSProperties {
  const _breakpoint = breakpoint;
  void _breakpoint;

  return {
    padding:
      breakpoint === 'desktop'
        ? desktopSize
          ? getSpacing(desktopSize)
          : tabletSize
            ? getSpacing(tabletSize)
            : getSpacing(mobileSize)
        : breakpoint === 'tablet'
          ? tabletSize
            ? getSpacing(tabletSize)
            : getSpacing(mobileSize)
          : getSpacing(mobileSize),
  };
}
