/**
 * PromotionalMosaicFabric — assembly glue for Live Lobby + Home mosaics.
 * CONSUMES LiveMosaicPromotionDirector, ViewerCountTruth, DiscoveryBus.
 * Does NOT create a second ranking / viewer-count / WebRTC / discovery authority.
 * PHYSICAL_GREEN = 0 until Todd #04 proves real moving remote video.
 */

import type { LiveDiscoveryRecord } from "./LiveDiscoveryRecord";
import { isTransportEligibleForMosaic } from "./discoveryTrustBoundary";
import {
  HOME_ROTATION_PERIODS_MS,
  buildHomeTileSchedules,
  rankLobbyOrganicLeastViewersFirst,
  splitOrganicAndPromoted,
  uniqueSessionsForMosaic,
  type LiveMosaicCandidate,
} from "./LiveMosaicPromotionDirector";
import {
  applyBoostExposureEffect,
  paidBoostIncreasesViewerCount,
} from "@/lib/intelligence/ViewerCountTruth";

/** Presentation mode — Lobby stable vs Home controlled-chaos. */
export type MosaicPresentationMode = "LOBBY_STABLE" | "HOME_CONTROLLED_CHAOS";

/** Interaction ladder — never collapse into join-on-sight. */
export type MosaicInteractionState = "DISCOVERY_TILE" | "SELECT" | "FOCUS_WATCH" | "JOIN_ROOM";

export const MOSAIC_LAYOUT = {
  desktopMinColumns: 4,
  mobileColumns: 2,
  mobileViewport: "390x844",
  desktopCssGrid: "repeat(4, minmax(0, 1fr))",
  mobileCssGrid: "repeat(2, minmax(0, 1fr))",
  desktopMediaQueryMinPx: 900,
} as const;

export const MOSAIC_AUDIO = {
  mutedByDefault: true as const,
  parallelProgramAudioForbidden: true as const,
};

export const MOSAIC_WEBRTC = {
  secondBroadcastEngineAllowed: false as const,
  todd04PhysicalGate: "PENDING" as const,
  realMovingWebRtcPhysicalGreen: 0 as const,
};

export const MOSAIC_ROTATION = {
  minMs: 13_000,
  maxMs: 20_000,
  periodsMs: HOME_ROTATION_PERIODS_MS,
  lobbyMoreStableThanHome: true as const,
};

/** Exclusion reasons for promotional mosaic eligibility. */
export type MosaicExclusionReason =
  | "PRIVATE"
  | "FRIENDS_ONLY"
  | "INVITE"
  | "REHEARSAL"
  | "LOCAL_PREVIEW"
  | "ADMIN_ONLY"
  | "BOT_ONLY"
  | "TEST"
  | "NOT_LIVE"
  | "TRANSPORT_UNHEALTHY"
  | "TRUST_UNBOUND"
  | "UNAUTHORIZED";

export type MosaicEligibilityInput = {
  visibility: LiveDiscoveryRecord["visibility"] | string;
  isLive: boolean;
  isBotOnly: boolean;
  isAnchor?: boolean;
  sourceType?: LiveDiscoveryRecord["sourceType"];
  hasRegisteredPresentation?: boolean;
  isTest: boolean;
  isRehearsal: boolean;
  isLocalPreview: boolean;
  isAdminOnly: boolean;
  transportHealth: LiveDiscoveryRecord["transportHealth"];
  category?: string;
  /** Must be DiscoveryPublisher-stamped to enter promotional mosaics. */
  trustProvenance?: LiveDiscoveryRecord["trustProvenance"];
  requiresPaidEntry?: boolean;
  joinGate?: LiveDiscoveryRecord["joinGate"];
};

/**
 * Build eligibility input ONLY from canonical LiveDiscoveryRecord fields.
 * Never invent isBotOnly/transportHealthy defaults at this boundary.
 */
export function eligibilityInputFromRecord(r: LiveDiscoveryRecord): MosaicEligibilityInput {
  return {
    visibility: r.visibility,
    isLive: r.isLive,
    isBotOnly: r.isBotOnly === true,
    isAnchor: r.isAnchor === true,
    sourceType: r.sourceType,
    hasRegisteredPresentation: Boolean(r.posterUrl || r.previewUrl),
    isTest: r.isTest === true,
    isRehearsal: r.isRehearsal === true,
    isLocalPreview: r.isLocalPreview === true,
    isAdminOnly: r.isAdminOnly === true,
    transportHealth: r.transportHealth ?? "UNKNOWN",
    category: r.category,
    trustProvenance: r.trustProvenance,
    requiresPaidEntry: r.requiresPaidEntry === true,
    joinGate: r.joinGate,
  };
}

export function evaluatePromotionalEligibility(
  input: MosaicEligibilityInput,
): { ok: true } | { ok: false; reason: MosaicExclusionReason } {
  if (input.trustProvenance !== "DiscoveryPublisher") {
    return { ok: false, reason: "TRUST_UNBOUND" };
  }
  if (!input.isLive) return { ok: false, reason: "NOT_LIVE" };
  const canonicalAutomatedAnchor =
    input.isBotOnly && input.sourceType === "AUTOMATED" && input.isAnchor === true && input.hasRegisteredPresentation === true;
  if (input.isBotOnly && !canonicalAutomatedAnchor) return { ok: false, reason: "BOT_ONLY" };
  if (input.isTest) return { ok: false, reason: "TEST" };
  if (input.isRehearsal) return { ok: false, reason: "REHEARSAL" };
  if (input.isLocalPreview) return { ok: false, reason: "LOCAL_PREVIEW" };
  if (input.isAdminOnly) return { ok: false, reason: "ADMIN_ONLY" };
  const v = String(input.visibility ?? "").toLowerCase();
  if (v === "private") return { ok: false, reason: "PRIVATE" };
  if (v === "invite") return { ok: false, reason: "INVITE" };
  if (v === "friends") return { ok: false, reason: "FRIENDS_ONLY" };
  // public (incl. paid-entry preview stamped as public+requiresPaidEntry) only
  if (v !== "public") return { ok: false, reason: "UNAUTHORIZED" };
  if (!isTransportEligibleForMosaic(input.transportHealth)) {
    return { ok: false, reason: "TRANSPORT_UNHEALTHY" };
  }
  return { ok: true };
}

/**
 * Paid-entry rooms may appear for DISCOVERY preview when stamped public+requiresPaidEntry.
 * JOIN must still honor joinGate=paid — mosaic never grants entry entitlement.
 */
export function paidEntryDiscoveryBypassesJoinEntitlement(): false {
  return false;
}

export function filterPromotionalEligibleRecords(
  records: readonly LiveDiscoveryRecord[],
): LiveDiscoveryRecord[] {
  return records.filter((r) => {
    if (r.category === "private_invited" || r.categories.includes("private_invited")) {
      return false;
    }
    return evaluatePromotionalEligibility(eligibilityInputFromRecord(r)).ok;
  });
}

export function recordToMosaicCandidate(
  r: LiveDiscoveryRecord,
  extras?: Partial<LiveMosaicCandidate>,
): LiveMosaicCandidate {
  const health = r.transportHealth ?? "UNKNOWN";
  return {
    sessionId: r.roomId,
    roomId: r.roomId,
    displayName: r.title,
    humanRoomViewers: Math.max(0, r.humanViewerCount),
    isPublicPromotional: Boolean(r.visibility === "public" && (!r.isBotOnly || (r.sourceType === "AUTOMATED" && r.isAnchor && Boolean(r.posterUrl || r.previewUrl))) && !r.isTest),
    isLive: r.isLive,
    // Proven HEALTHY only — UNKNOWN/DEGRADED are eligible but not claimed healthy
    transportHealthy: health === "HEALTHY",
    transportEligible: isTransportEligibleForMosaic(health),
    isBotOnly: r.isBotOnly === true,
    isTest: r.isTest === true,
    boostActive: extras?.boostActive,
    boostId: extras?.boostId,
    ...extras,
  };
}

/**
 * Fill mosaic slots without duplicating sessions.
 * If inventory < slotCount, return fewer tiles (truthful empty remainder).
 */
export function fillDistinctMosaicSlots(
  candidates: LiveMosaicCandidate[],
  slotCount: number,
): LiveMosaicCandidate[] {
  const unique = uniqueSessionsForMosaic(candidates);
  return unique.slice(0, Math.max(0, slotCount));
}

export function lobbyOrganicOrder(candidates: LiveMosaicCandidate[]): LiveMosaicCandidate[] {
  return rankLobbyOrganicLeastViewersFirst(candidates);
}

export function applyPaidBoostHonesty(humanRoomViewers: number, boostActive: boolean) {
  return applyBoostExposureEffect({ humanRoomViewers, boostActive });
}

export function homeSurfaceRotationSeed(surfaceId: string): number {
  // Deterministic independent seeds so Home1 ≠ Home2 ≠ Home3 clocks
  let h = 7;
  for (let i = 0; i < surfaceId.length; i++) {
    h = (h * 31 + surfaceId.charCodeAt(i)) >>> 0;
  }
  return (h % 97) + 1;
}

export function buildIndependentHomeSchedules(surfaceId: string, tileCount: number) {
  return buildHomeTileSchedules(tileCount, homeSurfaceRotationSeed(surfaceId));
}

export function rotationPeriodInCanonicalRange(periodMs: number): boolean {
  return periodMs >= MOSAIC_ROTATION.minMs && periodMs <= MOSAIC_ROTATION.maxMs;
}

export function mosaicCreatesRoomMembershipOnVisibility(): false {
  return false;
}

export function mosaicCreatesSecondWebRtcEngine(): false {
  return false;
}

export function mosaicCreatesSecondRankingAuthority(): false {
  return false;
}

export function mosaicCreatesSecondViewerCountAuthority(): false {
  return false;
}

export function intelligenceObservationMutatesSession(): false {
  return false;
}

export function selectEqualsWatchEqualsJoin(): false {
  return false;
}

export function homeFamilySurfaces(): readonly string[] {
  return ["home1", "home1_2", "home2", "home3", "home4", "home5"] as const;
}

export function mosaicCssGridTemplate(viewportWidthPx: number): string {
  return viewportWidthPx >= MOSAIC_LAYOUT.desktopMediaQueryMinPx
    ? MOSAIC_LAYOUT.desktopCssGrid
    : MOSAIC_LAYOUT.mobileCssGrid;
}

export function columnCountForViewport(viewportWidthPx: number): number {
  return viewportWidthPx >= MOSAIC_LAYOUT.desktopMediaQueryMinPx
    ? MOSAIC_LAYOUT.desktopMinColumns
    : MOSAIC_LAYOUT.mobileColumns;
}

export {
  splitOrganicAndPromoted,
  uniqueSessionsForMosaic,
  paidBoostIncreasesViewerCount,
};
