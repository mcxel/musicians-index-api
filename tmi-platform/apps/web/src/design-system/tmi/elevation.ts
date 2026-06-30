/**
 * TMI Design System — Elevation Tokens
 *
 * Z-index layering and shadow depths for consistent visual hierarchy.
 * Ensures modals always appear above panels, panels above stage, etc.
 *
 * @see CLAUDE.md Rule 18 (Visual Identity Formula)
 */

export const TMI_ELEVATION = {
  // Z-Index Scale
  zIndex: {
    // Background layers
    backdrop: 0,
    stage: 10,
    stageOverlay: 20,

    // Base UI
    panel: 100,
    canister: 100,
    navigationRail: 100,
    commandDeck: 100,
    chatTower: 100,
    musicPlayer: 100,

    // Floating elements
    floatingButton: 200,
    tooltip: 200,
    contextMenu: 200,

    // Elevated surfaces
    card: 250,
    drawer: 250,
    dropdown: 250,

    // Overlays & modals
    overlay: 300,
    modal: 300,
    dialog: 300,
    popover: 300,

    // Topmost
    notification: 400,
    alert: 400,
    toast: 400,
  },

  // Shadow Scales (depth perception)
  shadows: {
    // Subtle elevation (buttons, cards)
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',

    // Standard elevation (panels, dropdowns)
    md: '0 4px 12px rgba(0, 0, 0, 0.15)',

    // Medium elevation (modals, popovers)
    lg: '0 10px 25px rgba(0, 0, 0, 0.2)',

    // High elevation (floating panels)
    xl: '0 20px 40px rgba(0, 0, 0, 0.3)',

    // Maximum elevation (full-screen modals)
    '2xl': '0 30px 60px rgba(0, 0, 0, 0.4)',

    // Inset shadow (recessed surfaces)
    inset: 'inset 0 0 10px rgba(0, 0, 0, 0.2)',

    // No shadow (flat)
    none: 'none',
  },

  // Glow shadows (for neon effects)
  glowShadows: {
    // Subtle glow (background elements)
    sm: '0 0 10px rgba(0, 255, 255, 0.2)',

    // Medium glow (interactive elements)
    md: '0 0 20px rgba(0, 255, 255, 0.4)',

    // Strong glow (active elements)
    lg: '0 0 30px rgba(0, 255, 255, 0.6)',

    // Intense glow (featured elements)
    xl: '0 0 50px rgba(0, 255, 255, 0.8)',
  },

  // Layering Guidelines
  layers: {
    background: {
      zIndex: 0,
      shadow: 'none',
      description: 'Stage, backdrops, base surfaces',
    },

    baseUI: {
      zIndex: 100,
      shadow: 'md',
      description: 'Navigation, panels, fixed UI',
    },

    floating: {
      zIndex: 200,
      shadow: 'lg',
      description: 'Floating buttons, tooltips, context menus',
    },

    elevated: {
      zIndex: 250,
      shadow: 'lg',
      description: 'Cards, drawers, dropdowns',
    },

    modal: {
      zIndex: 300,
      shadow: 'xl',
      description: 'Modals, dialogs, overlays',
    },

    notification: {
      zIndex: 400,
      shadow: 'xl',
      description: 'Alerts, toasts, notifications',
    },
  },
} as const;

/**
 * Get z-index value
 * @example getZIndex('modal')
 */
export function getZIndex(layer: keyof typeof TMI_ELEVATION.zIndex): number {
  return TMI_ELEVATION.zIndex[layer];
}

/**
 * Get shadow for a given depth
 * @example getShadow('md')
 */
export function getShadow(depth: keyof typeof TMI_ELEVATION.shadows): string {
  return TMI_ELEVATION.shadows[depth];
}

/**
 * Get glow shadow for a given intensity
 * @example getGlowShadow('lg')
 */
export function getGlowShadow(intensity: keyof typeof TMI_ELEVATION.glowShadows): string {
  return TMI_ELEVATION.glowShadows[intensity];
}

/**
 * Apply elevation styling (z-index + shadow)
 * @example applyElevation('modal')
 */
export function applyElevation(
  layerName: keyof typeof TMI_ELEVATION.layers,
): React.CSSProperties {
  const layer = TMI_ELEVATION.layers[layerName];
  return {
    zIndex: layer.zIndex,
    boxShadow: layer.shadow,
  };
}

/**
 * Get complete layer styling by name
 * @example getLayer('floating')
 */
export function getLayer(layerName: keyof typeof TMI_ELEVATION.layers) {
  return TMI_ELEVATION.layers[layerName];
}

/**
 * Stack elements with proper elevation
 * Creates a responsive elevation system
 * @example stackElements('modal', 'overlay')
 */
export function stackElements(
  ...layerNames: (keyof typeof TMI_ELEVATION.layers)[]
): Array<React.CSSProperties> {
  return layerNames.map((name) => applyElevation(name));
}
