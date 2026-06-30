/**
 * TMI Design System — Border Tokens
 *
 * Consistent border styles, widths, and radii across the platform.
 *
 * @see CLAUDE.md Rule 18 (Visual Identity Formula)
 */

export const TMI_BORDERS = {
  // Border Widths
  width: {
    thin: '1px',
    default: '1px',
    medium: '2px',
    thick: '3px',
    heavy: '4px',
  },

  // Border Radius (rounded corners)
  radius: {
    none: '0px',
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },

  // Border Styles (by component type)
  styles: {
    // Default glass panel border (subtle)
    glass: {
      width: '1px',
      style: 'solid',
      color: 'rgba(0, 255, 255, 0.1)',
      radius: '8px',
    },

    // Active/interactive border (glow)
    active: {
      width: '1px',
      style: 'solid',
      color: 'rgba(0, 255, 255, 0.5)',
      radius: '8px',
    },

    // Neon border (glowing)
    neon: {
      width: '2px',
      style: 'solid',
      color: '#00ffff',
      radius: '8px',
    },

    // Subtle divider
    divider: {
      width: '1px',
      style: 'solid',
      color: 'rgba(255, 255, 255, 0.05)',
      radius: '0px',
    },

    // Button border (standard)
    button: {
      width: '1px',
      style: 'solid',
      color: 'rgba(255, 255, 255, 0.3)',
      radius: '6px',
    },

    // Modal border (strong)
    modal: {
      width: '2px',
      style: 'solid',
      color: 'rgba(0, 255, 255, 0.3)',
      radius: '12px',
    },

    // Card border (standard)
    card: {
      width: '1px',
      style: 'solid',
      color: 'rgba(255, 255, 255, 0.1)',
      radius: '8px',
    },

    // Input border
    input: {
      width: '1px',
      style: 'solid',
      color: 'rgba(0, 255, 255, 0.2)',
      radius: '4px',
    },

    // Broadcast border (thick, prominent)
    broadcast: {
      width: '3px',
      style: 'solid',
      color: 'rgba(0, 255, 255, 0.4)',
      radius: '0px',
    },

    // No border
    none: {
      width: '0px',
      style: 'none',
      color: 'transparent',
      radius: '0px',
    },
  },

  // Feature-Specific Borders (by color)
  featureBorders: {
    playlist: {
      width: '1px',
      color: 'rgba(0, 255, 255, 0.3)',
      glow: '0 0 10px rgba(0, 255, 255, 0.4)',
    },
    memoryWall: {
      width: '1px',
      color: 'rgba(255, 0, 255, 0.3)',
      glow: '0 0 10px rgba(255, 0, 255, 0.4)',
    },
    goLive: {
      width: '2px',
      color: 'rgba(255, 0, 0, 0.5)',
      glow: '0 0 15px rgba(255, 0, 0, 0.5)',
    },
    battles: {
      width: '1px',
      color: 'rgba(255, 215, 0, 0.3)',
      glow: '0 0 10px rgba(255, 215, 0, 0.3)',
    },
  },

  // Border Combinations (ready to use)
  presets: {
    glassPanel: `1px solid rgba(0, 255, 255, 0.1)`,
    activePanel: `1px solid rgba(0, 255, 255, 0.5)`,
    neonPanel: `2px solid rgba(0, 255, 255, 0.8)`,
    subtleCard: `1px solid rgba(255, 255, 255, 0.1)`,
    button: `1px solid rgba(255, 255, 255, 0.3)`,
    modal: `2px solid rgba(0, 255, 255, 0.3)`,
    divider: `1px solid rgba(255, 255, 255, 0.05)`,
    input: `1px solid rgba(0, 255, 255, 0.2)`,
  },
} as const;

/**
 * Get border radius value
 * @example getBorderRadius('lg')
 */
export function getBorderRadius(size: keyof typeof TMI_BORDERS.radius): string {
  return TMI_BORDERS.radius[size];
}

/**
 * Get border width
 * @example getBorderWidth('medium')
 */
export function getBorderWidth(size: keyof typeof TMI_BORDERS.width): string {
  return TMI_BORDERS.width[size];
}

/**
 * Get border style (complete style object)
 * @example getBorderStyle('glass')
 */
export function getBorderStyle(
  styleName: keyof typeof TMI_BORDERS.styles,
): React.CSSProperties {
  const style = TMI_BORDERS.styles[styleName];
  return {
    border: `${style.width} ${style.style} ${style.color}`,
    borderRadius: style.radius,
  };
}

/**
 * Apply a border preset
 * @example applyBorderPreset('neonPanel')
 */
export function applyBorderPreset(
  presetName: keyof typeof TMI_BORDERS.presets,
): React.CSSProperties {
  return {
    border: TMI_BORDERS.presets[presetName],
  };
}

/**
 * Create a feature-specific border
 * @example getFeatureBorder('playlist')
 */
export function getFeatureBorder(
  feature: keyof typeof TMI_BORDERS.featureBorders,
): React.CSSProperties {
  const border = TMI_BORDERS.featureBorders[feature];
  return {
    border: `${border.width} solid ${border.color}`,
    boxShadow: border.glow,
  };
}

/**
 * Combine border radius with other styles
 * @example applyBorderRadius('lg', { padding: '16px' })
 */
export function applyBorderRadius(
  size: keyof typeof TMI_BORDERS.radius,
  overrides?: React.CSSProperties,
): React.CSSProperties {
  return {
    borderRadius: getBorderRadius(size),
    ...overrides,
  };
}
