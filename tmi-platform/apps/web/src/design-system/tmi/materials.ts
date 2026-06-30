/**
 * TMI Design System — Material Tokens
 *
 * Standardized material definitions for consistent surfaces across the platform.
 * Every panel, component, and surface uses one of these material definitions.
 *
 * Materials:
 * - Glass (navigation, panels, menus)
 * - Brushed Titanium (controls, frames, equipment)
 * - Neon (interactive elements, accents)
 * - Chrome (highlights only)
 * - Carbon Fiber (professional studio equipment)
 * - Matte Black (studio backdrop)
 * - LED Panel (displays, screens)
 * - Acrylic (translucent surfaces)
 * - Stage Lighting (broadcast lighting effects)
 * - Studio Monitor (professional displays)
 * - Broadcast Screen (live feeds)
 *
 * @see CLAUDE.md Rule 18 (Visual Identity Formula), Rule 7 (Visual Canon)
 */

export const TMI_MATERIALS = {
  // Glass Material — Navigation, workspace, menus, panels
  glass: {
    id: 'glass',
    name: 'Glass',
    background: 'rgba(10, 6, 20, 0.5)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
    description: 'Frosted glass with subtle blur and inset shadow',
    usage: ['navigation', 'panels', 'menus', 'workspace', 'dialogs'],
  },

  frostedGlass: {
    id: 'frostedGlass',
    name: 'Frosted Glass',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
    description: 'Heavy frosted glass, more opaque',
    usage: ['overlay', 'modal', 'floating-panel', 'premium-surface'],
  },

  // Brushed Titanium Material — Controls, frames, equipment
  brushedTitanium: {
    id: 'brushedTitanium',
    name: 'Brushed Titanium',
    background: 'linear-gradient(90deg, #2a2a3e 0%, #1a1a2e 50%, #2a2a3e 100%)',
    border: '1px solid #3a3a4e',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.5)',
    description: 'Brushed metal finish with directional lighting',
    usage: ['buttons', 'controls', 'frames', 'broadcast-equipment', 'dj-deck'],
  },

  // Neon Material — Interactive elements, accents, glowing controls
  neon: {
    id: 'neon',
    name: 'Neon',
    background: 'rgba(0, 255, 255, 0.08)',
    border: '1px solid rgba(0, 255, 255, 0.8)',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.2)',
    description: 'Glowing neon with intense saturation (color varies per feature)',
    usage: ['active-control', 'live-indicator', 'interactive-element', 'accent'],
  },

  // Chrome Material — Highlights, reflections, accents only
  chrome: {
    id: 'chrome',
    name: 'Chrome',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 2px 8px rgba(255, 255, 255, 0.15)',
    description: 'Shiny chrome reflection and highlight',
    usage: ['highlight', 'reflection', 'accent-only', 'glossy-effect'],
  },

  // Carbon Fiber Material — Professional studio equipment
  carbonFiber: {
    id: 'carbonFiber',
    name: 'Carbon Fiber',
    background: 'repeating-linear-gradient(45deg, #0a0614, #0a0614 2px, #1a1a2e 2px, #1a1a2e 4px)',
    border: '1px solid rgba(0, 0, 0, 0.5)',
    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.5)',
    description: 'Diagonal weave pattern with inset lighting',
    usage: ['control-console', 'dj-desk', 'professional-equipment', 'broadcast-control'],
  },

  // Matte Black Material — Studio backdrop, dark surfaces
  matte: {
    id: 'matte',
    name: 'Matte Black',
    background: '#050510',
    border: '1px solid rgba(0, 0, 0, 0.5)',
    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
    description: 'Flat matte black with no reflection',
    usage: ['backdrop', 'dark-surface', 'stage-floor', 'broadcast-background'],
  },

  // LED Panel Material — Live displays, screens, monitors
  ledPanel: {
    id: 'ledPanel',
    name: 'LED Panel',
    background: '#0a0614',
    border: '2px solid rgba(0, 255, 255, 0.3)',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)',
    description: 'Glowing LED panel with scan lines effect',
    usage: ['live-display', 'video-screen', 'monitor', 'broadcast-feed'],
  },

  // Acrylic Material — Translucent surfaces, light boxes
  acrylic: {
    id: 'acrylic',
    name: 'Acrylic',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.1)',
    description: 'Translucent acrylic with light transmission',
    usage: ['light-box', 'translucent-panel', 'semi-transparent-surface'],
  },

  // Stage Lighting Material — Broadcast lighting effects, ambient
  stageLighting: {
    id: 'stageLighting',
    name: 'Stage Lighting',
    background: 'radial-gradient(circle, rgba(155, 89, 255, 0.2) 0%, rgba(155, 89, 255, 0) 70%)',
    border: 'none',
    boxShadow: '0 0 40px rgba(155, 89, 255, 0.3), 0 0 80px rgba(155, 89, 255, 0.1)',
    description: 'Broadcast stage lighting with radiant glow (color varies by context)',
    usage: ['ambient-lighting', 'broadcast-glow', 'event-lighting', 'atmosphere'],
  },

  // Studio Monitor Material — Professional display surfaces
  studioMonitor: {
    id: 'studioMonitor',
    name: 'Studio Monitor',
    background: '#1a1a2e',
    border: '2px solid #2a2a3e',
    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
    description: 'Professional studio monitor bezels',
    usage: ['monitor-frame', 'screen-bezel', 'professional-display', 'control-panel'],
  },

  // Broadcast Screen Material — Live video feeds, stream displays
  broadcastScreen: {
    id: 'broadcastScreen',
    name: 'Broadcast Screen',
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9))',
    border: '3px solid rgba(0, 255, 255, 0.2)',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.8)',
    description: 'Live broadcast feed with minimal border',
    usage: ['video-feed', 'live-stream', 'broadcast-display', 'performer-monitor'],
  },
} as const;

/**
 * Get material token by ID
 * @example getMaterial('glass')
 */
export function getMaterial(materialId: keyof typeof TMI_MATERIALS) {
  return TMI_MATERIALS[materialId];
}

/**
 * Apply material styling to an element
 * @example applyMaterial('glass', { color: '#00ffff' })
 */
export function applyMaterial(
  materialId: keyof typeof TMI_MATERIALS,
  overrides?: React.CSSProperties,
): React.CSSProperties {
  const material = getMaterial(materialId);
  return {
    background: material.background,
    border: material.border,
    boxShadow: material.boxShadow,
    ...overrides,
  };
}

/**
 * Get all materials (for design system preview)
 */
export function getAllMaterials() {
  return Object.values(TMI_MATERIALS);
}

/**
 * Get materials by usage context
 * @example getMaterialsByUsage('navigation')
 */
export type MaterialUsage = (typeof TMI_MATERIALS)[keyof typeof TMI_MATERIALS]['usage'][number];

export function getMaterialsByUsage(usage: MaterialUsage) {
  return Object.values(TMI_MATERIALS).filter((m) =>
    (m.usage as readonly MaterialUsage[]).includes(usage),
  );
}
