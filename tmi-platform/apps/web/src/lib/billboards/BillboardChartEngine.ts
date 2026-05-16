/**
 * BillboardChartEngine.ts
 *
 * Creates billboard surfaces showing different chart rankings.
 * Supports: global, country, genre, battle, cypher billboards.
 * Purpose: Visual surfaces for ranking displays across platform.
 */

export interface Billboard {
  billboardId: string;
  billboardType: 'global' | 'country' | 'genre' | 'battle' | 'cypher';
  displayName: string;
  routePath: string;
  chartSource: string; // chart ID
  maxRankingsDisplay: number;
  refreshIntervalMs: number;
  currentRankings: Array<{
    rank: number;
    artistId: string;
    displayName: string;
    xpOrScore: number;
    trendIcon: 'up' | 'down' | 'stable';
    flagOrBadge?: string;
  }>;
  createdAt: number;
  lastRefreshed: number;
  isActive: boolean;
}

export interface BillboardPlacement {
  placementId: string;
  billboardId: string;
  route: string;
  slotPosition: string;
  displayOrder: number;
  placedAt: number;
}

// In-memory registries
const billboards = new Map<string, Billboard>();
const billboardPlacements = new Map<string, BillboardPlacement>();
let billboardCounter = 0;

/**
 * Creates billboard for chart.
 */
export function createBillboard(input: {
  billboardType: 'global' | 'country' | 'genre' | 'battle' | 'cypher';
  displayName: string;
  routePath: string;
  chartSource: string;
  maxRankingsDisplay?: number;
  refreshIntervalMs?: number;
}): string {
  const billboardId = `billboard-${billboardCounter++}-${input.billboardType}`;

  const billboard: Billboard = {
    billboardId,
    billboardType: input.billboardType,
    displayName: input.displayName,
    routePath: input.routePath,
    chartSource: input.chartSource,
    maxRankingsDisplay: input.maxRankingsDisplay ?? 20,
    refreshIntervalMs: input.refreshIntervalMs ?? 300000, // 5 minutes default
    currentRankings: [],
    createdAt: Date.now(),
    lastRefreshed: Date.now(),
    isActive: true,
  };

  billboards.set(billboardId, billboard);
  return billboardId;
}

/**
 * Updates billboard rankings (from chart data).
 */
export function updateBillboardRankings(
  billboardId: string,
  rankings: Array<{
    rank: number;
    artistId: string;
    displayName: string;
    xpOrScore: number;
    trendIcon: 'up' | 'down' | 'stable';
    flagOrBadge?: string;
  }>
): void {
  const billboard = billboards.get(billboardId);
  if (billboard) {
    billboard.currentRankings = rankings.slice(0, billboard.maxRankingsDisplay);
    billboard.lastRefreshed = Date.now();
  }
}

/**
 * Activates billboard (makes visible).
 */
export function activateBillboard(billboardId: string): void {
  const billboard = billboards.get(billboardId);
  if (billboard) {
    billboard.isActive = true;
  }
}

/**
 * Deactivates billboard (hides from display).
 */
export function deactivateBillboard(billboardId: string): void {
  const billboard = billboards.get(billboardId);
  if (billboard) {
    billboard.isActive = false;
  }
}

/**
 * Places billboard on route.
 */
export function placeBillboardOnRoute(input: {
  billboardId: string;
  route: string;
  slotPosition: string;
  displayOrder: number;
}): string {
  const placementId = `placement-${input.billboardId}-${Date.now()}`;

  const placement: BillboardPlacement = {
    placementId,
    billboardId: input.billboardId,
    route: input.route,
    slotPosition: input.slotPosition,
    displayOrder: input.displayOrder,
    placedAt: Date.now(),
  };

  billboardPlacements.set(placementId, placement);
  return placementId;
}

/**
 * Gets billboard (non-mutating).
 */
export function getBillboard(billboardId: string): Billboard | null {
  return billboards.get(billboardId) ?? null;
}

/**
 * Lists billboards by type (non-mutating).
 */
export function listBillboardsByType(billboardType: string): Billboard[] {
  return Array.from(billboards.values()).filter(
    (b) => b.billboardType === billboardType && b.isActive
  );
}

/**
 * Lists billboards on route (non-mutating).
 */
export function listBillboardsOnRoute(route: string): Billboard[] {
  const placementIds = Array.from(billboardPlacements.values())
    .filter((p) => p.route === route)
    .map((p) => p.billboardId);

  return Array.from(billboards.values()).filter(
    (b) => placementIds.includes(b.billboardId) && b.isActive
  );
}

/**
 * Checks if billboard needs refresh.
 */
export function billboardNeedsRefresh(billboardId: string): boolean {
  const billboard = billboards.get(billboardId);
  if (!billboard) return false;

  return Date.now() - billboard.lastRefreshed > billboard.refreshIntervalMs;
}

/**
 * Gets active billboards (admin reporting).
 */
export function listActiveBillboards(): Billboard[] {
  return Array.from(billboards.values()).filter((b) => b.isActive);
}

/**
 * Gets billboard report (admin).
 */
export function getBillboardReport(): {
  totalBillboards: number;
  activeBillboards: number;
  byType: Record<string, number>;
  totalPlacements: number;
} {
  const all = Array.from(billboards.values());
  const active = all.filter((b) => b.isActive);

  const byType: Record<string, number> = {};
  all.forEach((b) => {
    byType[b.billboardType] = (byType[b.billboardType] ?? 0) + 1;
  });

  return {
    totalBillboards: all.length,
    activeBillboards: active.length,
    byType,
    totalPlacements: billboardPlacements.size,
  };
}

/**
 * Gets standard billboard configuration template.
 */
export function getBillboardTemplate(type: 'global' | 'country' | 'genre' | 'battle' | 'cypher'): {
  displayName: string;
  routePath: string;
  maxRankings: number;
  refreshIntervalMs: number;
} {
  const templates: Record<string, any> = {
    global: {
      displayName: 'Global Billboard',
      routePath: '/billboards/global',
      maxRankings: 10,
      refreshIntervalMs: 600000, // 10 minutes
    },
    country: {
      displayName: 'Country Billboard',
      routePath: '/billboards/country/[country]',
      maxRankings: 20,
      refreshIntervalMs: 600000,
    },
    genre: {
      displayName: 'Genre Billboard',
      routePath: '/billboards/genre/[genre]',
      maxRankings: 20,
      refreshIntervalMs: 600000,
    },
    battle: {
      displayName: 'Battle Billboard',
      routePath: '/billboards/battle',
      maxRankings: 5,
      refreshIntervalMs: 300000, // 5 minutes (more frequent)
    },
    cypher: {
      displayName: 'Cypher Billboard',
      routePath: '/billboards/cypher',
      maxRankings: 5,
      refreshIntervalMs: 300000,
    },
  };

  return templates[type];
}
