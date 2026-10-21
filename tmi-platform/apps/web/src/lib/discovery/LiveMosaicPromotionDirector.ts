/**
 * Live Mosaic Promotion Director — HOME controlled-chaos vs LOBBY least-viewers ladder.
 * Extends DiscoveryBus / GlobalLiveSession — NOT a second WebRTC or discovery engine.
 * BOT != HUMAN. Preview != room viewer. Boost buys exposure, never fake viewers.
 */

export type MosaicSurface = "HOME" | "LOBBY_WALL";

export type LiveMosaicCandidate = {
  sessionId: string;
  roomId: string;
  programSourceId?: string;
  displayName: string;
  experienceType?: string;
  /** Canonical qualifying HUMAN room viewers — never mosaic impressions. */
  humanRoomViewers: number;
  isPublicPromotional: boolean;
  isLive: boolean;
  transportHealthy: boolean;
  transportEligible?: boolean;
  isBotOnly: boolean;
  isTest?: boolean;
  category?: string;
  boostActive?: boolean;
  boostId?: string;
  lastOrganicExposureAt?: number;
};

export type HomeTileSchedule = {
  tileIndex: number;
  periodMs: number;
  phaseOffsetMs: number;
  pinned: boolean;
  currentSessionId: string | null;
};

/** Canonical Home rotation window: 13–20 seconds with deterministic stagger. */
export const HOME_ROTATION_PERIODS_MS = [
  13_000, 17_000, 14_000, 20_000, 16_000, 19_000, 15_000, 18_000,
  13_500, 16_500, 14_500, 19_500, 15_500, 18_500, 17_500, 20_000,
] as const;

export function buildHomeTileSchedules(tileCount: number, seed = 7): HomeTileSchedule[] {
  const out: HomeTileSchedule[] = [];
  for (let i = 0; i < tileCount; i++) {
    const periodMs = HOME_ROTATION_PERIODS_MS[i % HOME_ROTATION_PERIODS_MS.length]!;
    const phaseOffsetMs = ((i * 997 + seed * 131) % periodMs);
    out.push({
      tileIndex: i,
      periodMs,
      phaseOffsetMs,
      pinned: false,
      currentSessionId: null,
    });
  }
  return out;
}

/** Independent per-tile due check — never replaceEveryTile(). */
export function isHomeTileDue(tile: HomeTileSchedule, nowMs: number, startedAtMs: number): boolean {
  if (tile.pinned) return false;
  const elapsed = nowMs - startedAtMs - tile.phaseOffsetMs;
  if (elapsed < 0) return false;
  return elapsed % tile.periodMs < 250; // due window for pollers
}

export function nextHomeRotationDueAt(tile: HomeTileSchedule, nowMs: number, startedAtMs: number): number {
  if (tile.pinned) return Number.POSITIVE_INFINITY;
  const elapsed = Math.max(0, nowMs - startedAtMs - tile.phaseOffsetMs);
  const cycles = Math.floor(elapsed / tile.periodMs);
  return startedAtMs + tile.phaseOffsetMs + (cycles + 1) * tile.periodMs;
}

/**
 * Lobby Wall organic order: least qualifying human room viewers first.
 * Stabilization/hysteresis applied by caller using minPlacementDuration.
 */
export function rankLobbyOrganicLeastViewersFirst(
  candidates: LiveMosaicCandidate[],
  opts?: { nowMs?: number; recentExposureCooldownMs?: number },
): LiveMosaicCandidate[] {
  const cooldown = opts?.recentExposureCooldownMs ?? 8_000;
  const now = opts?.nowMs ?? Date.now();
  return candidates
    .filter((c) => {
      const transportOk = c.transportEligible ?? c.transportHealthy;
      return c.isPublicPromotional && c.isLive && transportOk && !c.isBotOnly && !c.isTest;
    })
    .slice()
    .sort((a, b) => {
      // Promoted inventory is separated by caller; organic sort ignores boost for organic lane.
      if (a.humanRoomViewers !== b.humanRoomViewers) {
        return a.humanRoomViewers - b.humanRoomViewers;
      }
      const aExp = a.lastOrganicExposureAt ?? 0;
      const bExp = b.lastOrganicExposureAt ?? 0;
      // Prefer least recent exposure when tied
      if (aExp !== bExp) return aExp - bExp;
      return a.sessionId.localeCompare(b.sessionId);
    })
    .map((c) => {
      // cooldown metadata only — ranking already used lastOrganicExposureAt
      void cooldown;
      void now;
      return c;
    });
}

export function splitOrganicAndPromoted(
  candidates: LiveMosaicCandidate[],
  promotedInventorySlots: number,
): { organic: LiveMosaicCandidate[]; promoted: LiveMosaicCandidate[] } {
  const boosted = candidates.filter((c) => c.boostActive && c.isLive && c.transportHealthy && c.isPublicPromotional);
  const organicPool = candidates.filter((c) => !c.boostActive);
  const organic = rankLobbyOrganicLeastViewersFirst(organicPool);
  const promoted = boosted.slice(0, Math.max(0, promotedInventorySlots));
  return { organic, promoted };
}

export type LiveBoostEntitlement = {
  boostId: string;
  productId: string;
  roomId: string;
  sessionId: string;
  ownerId: string;
  startAt: number;
  endAt: number;
  status: "ACTIVE" | "EXPIRED" | "PAUSED" | "ENDED_WITH_SESSION";
  orderId?: string;
};

export function isBoostActive(boost: LiveBoostEntitlement, nowMs = Date.now()): boolean {
  if (boost.status !== "ACTIVE") return false;
  return nowMs >= boost.startAt && nowMs < boost.endAt;
}

/** Deduplicate sessions within one mosaic viewport. */
export function uniqueSessionsForMosaic(candidates: LiveMosaicCandidate[]): LiveMosaicCandidate[] {
  const seen = new Set<string>();
  const out: LiveMosaicCandidate[] = [];
  for (const c of candidates) {
    if (seen.has(c.sessionId)) continue;
    seen.add(c.sessionId);
    out.push(c);
  }
  return out;
}

export const LiveMosaicPromotionDirector = {
  buildHomeTileSchedules,
  isHomeTileDue,
  nextHomeRotationDueAt,
  rankLobbyOrganicLeastViewersFirst,
  splitOrganicAndPromoted,
  isBoostActive,
  uniqueSessionsForMosaic,
};
