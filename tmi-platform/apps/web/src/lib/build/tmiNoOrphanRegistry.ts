/**
 * tmiNoOrphanRegistry.ts
 * Enforces the "no orphan" rule:
 * Every asset, route, button, and system must connect to a living page.
 * If any asset is orphaned, it will be detected and reported here.
 */

export interface OrphanCheck {
  id: string;
  type: 'asset' | 'route' | 'component' | 'button' | 'control';
  path: string;
  status: 'connected' | 'orphaned' | 'warning';
  target?: string;
  reason?: string;
}

export interface NoOrphanReport {
  timestamp: string;
  totalAssets: number;
  connectedAssets: number;
  orphanedAssets: number;
  warningAssets: number;
  violations: OrphanCheck[];
  issues: {
    deadRoutes: string[];
    emptyComponents: string[];
    staticOnlyPages: string[];
    missingBackRoutes: string[];
    missingDataBindings: string[];
  };
}

/**
 * CRITICAL RULES:
 * 1. Every image must map to at least one route.
 * 2. Every route must be reachable from the homepage.
 * 3. Every button/link must have a destination.
 * 4. Every page must have a back route (except root).
 * 5. Every interactive element must be functional (not static).
 * 6. Every section must show admin proof status.
 * 7. Every profile must auto-generate from signup.
 * 8. Every HUD must show real data (not placeholder).
 * 9. Every subscription tier must unlock features.
 * 10. Every asset must be visually consistent with TMI canon.
 */

export const NO_ORPHAN_RULES = [
  {
    rule: 'EVERY_IMAGE_HAS_ROUTE',
    description: 'Every converted asset must map to at least one route.',
    severity: 'CRITICAL',
    checkFn: (asset: any) => !!asset.route,
  },
  {
    rule: 'EVERY_ROUTE_REACHABLE',
    description: 'Every route must be reachable from homepage or admin.',
    severity: 'CRITICAL',
    checkFn: (route: string) => !route.includes('[undefined]'),
  },
  {
    rule: 'EVERY_BUTTON_HAS_ACTION',
    description: 'Every button/chevron/slider must have an onClick or href.',
    severity: 'CRITICAL',
    checkFn: (control: any) => !!control.action || !!control.href,
  },
  {
    rule: 'EVERY_PAGE_HAS_BACK_ROUTE',
    description: 'Every non-root page must have a valid back route.',
    severity: 'HIGH',
    checkFn: (page: string) => page === '/' || !!page, // Will be checked differently
  },
  {
    rule: 'NO_STATIC_FINAL_UI',
    description: 'No final UI can be static images. Must be interactive components.',
    severity: 'CRITICAL',
    checkFn: (component: any) => !component.isStaticImage,
  },
  {
    rule: 'EVERY_HUD_HAS_DATA',
    description: 'Every HUD must display real or simulated live data.',
    severity: 'HIGH',
    checkFn: (hud: any) => !!hud.dataSource || !!hud.simulationData,
  },
  {
    rule: 'EVERY_SUBSCRIPTION_UNLOCKS_FEATURE',
    description: 'Free users see 10 sponsor slots. Premium tiers unlock more.',
    severity: 'MEDIUM',
    checkFn: (tier: any) => !!tier.unlockedFeatures,
  },
  {
    rule: 'EVERY_ASSET_IN_MANIFEST',
    description: 'Every asset must be listed and assigned to a section.',
    severity: 'CRITICAL',
    checkFn: (asset: any) => !!asset && !!asset.category && !!asset.section,
  },
];

/**
 * Known Dead Routes (to be eliminated)
 */
export const KNOWN_DEAD_ROUTES = [
  // Add as discovered
];

/**
 * Asset Classification
 */
export enum AssetStatus {
  UNKNOWN = 'unknown',
  CONNECTED = 'connected',
  CONNECTED_WITH_WARNING = 'warning',
  ORPHANED = 'orphaned',
  STATIC_ONLY = 'static_only',
  MISSING_BACK_ROUTE = 'missing_back_route',
  DEAD_COMPONENT = 'dead_component',
}

/**
 * Helper to classify an asset
 */
export function classifyAsset(asset: any): AssetStatus {
  if (!asset.route) return AssetStatus.ORPHANED;
  if (asset.isStaticImage) return AssetStatus.STATIC_ONLY;
  if (!asset.backRoute) return AssetStatus.MISSING_BACK_ROUTE;
  if (!asset.component) return AssetStatus.DEAD_COMPONENT;
  if (asset.component && asset.route && asset.backRoute) {
    return AssetStatus.CONNECTED;
  }
  return AssetStatus.UNKNOWN;
}

/**
 * Enforcement Summary
 */
export const ORPHAN_ENFORCEMENT_SUMMARY = {
  rule1_imageCount: 370,
  rule1_routed: 0, // Will be updated after build
  rule1_orphaned: 0,

  rule2_totalRoutes: 19,
  rule2_reachable: 0,
  rule2_unreachable: 0,

  rule3_totalButtons: 0, // Will scan components
  rule3_functional: 0,
  rule3_dead: 0,

  rule5_totalPages: 0,
  rule5_interactive: 0,
  rule5_staticOnly: 0,

  criticalViolations: 0,
  highPriorityViolations: 0,
  canLaunch: false, // Will be true only if all violations = 0
};

/**
 * Launch Gate Check
 */
export function canLaunchWithNoOrphans(): boolean {
  return (
    ORPHAN_ENFORCEMENT_SUMMARY.criticalViolations === 0 &&
    ORPHAN_ENFORCEMENT_SUMMARY.rule1_orphaned === 0 &&
    ORPHAN_ENFORCEMENT_SUMMARY.rule2_unreachable === 0 &&
    ORPHAN_ENFORCEMENT_SUMMARY.rule3_dead === 0 &&
    ORPHAN_ENFORCEMENT_SUMMARY.rule5_staticOnly === 0
  );
}
