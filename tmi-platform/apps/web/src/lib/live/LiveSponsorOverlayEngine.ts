/**
 * LiveSponsorOverlayEngine
 * Sponsor overlays, rotation, and priority during live events.
 * Converts sponsor visibility scores into active room placements.
 */

import { SponsorVisibilityWeightEngine } from "../sponsors/SponsorVisibilityWeightEngine";

export type SponsorOverlayPlacement = "live-bug" | "lower-third" | "watermark" | "outro-mention" | "intermission-slate";

export type LiveSponsorOverlay = {
  overlayId: string;
  roomId: string;
  sponsorId: string;
  sponsorName: string;
  assetUrl?: string;
  placement: SponsorOverlayPlacement;
  priorityScore: number;
  visibilityTier: string;
  active: boolean;
};

// --- in-memory store ---
const overlays: LiveSponsorOverlay[] = [];
let overlayCounter = 0;

// --- Write API ---

export function registerLiveSponsor(input: {
  roomId: string;
  sponsorId: string;
  sponsorName: string;
  assetUrl?: string;
  totalSpendCents: number;
  campaignPerformanceScore: number;
  activeCampaignsCount: number;
  artistSponsorshipCount: number;
  merchantProductCount: number;
}): LiveSponsorOverlay[] {
  const visibility = SponsorVisibilityWeightEngine.calculateVisibility({
    sponsorId: input.sponsorId,
    totalSpendCents: input.totalSpendCents,
    campaignPerformanceScore: input.campaignPerformanceScore,
    activeCampaignsCount: input.activeCampaignsCount,
    artistSponsorshipCount: input.artistSponsorshipCount,
    merchantProductCount: input.merchantProductCount,
  });

  const created: LiveSponsorOverlay[] = [];

  // Scale placements organically according to the visibility score
  const placements: SponsorOverlayPlacement[] = ["live-bug"];
  if (visibility.sponsorPriorityScore > 200) placements.push("lower-third");
  if (visibility.sponsorPriorityScore > 1000) placements.push("intermission-slate", "outro-mention");
  if (visibility.sponsorPriorityScore > 5000) placements.push("watermark");

  for (const placement of placements) {
    const overlay: LiveSponsorOverlay = {
      overlayId: `overlay-${++overlayCounter}`,
      roomId: input.roomId,
      sponsorId: input.sponsorId,
      sponsorName: input.sponsorName,
      assetUrl: input.assetUrl,
      placement,
      priorityScore: visibility.sponsorPriorityScore,
      visibilityTier: visibility.visibilityTier,
      active: true,
    };
    overlays.unshift(overlay);
    created.push(overlay);
  }

  return created;
}

// --- Read & Rotation API ---

export function getSponsorOverlaysForRoom(roomId: string, placement?: SponsorOverlayPlacement): LiveSponsorOverlay[] {
  let roomOverlays = overlays.filter((o) => o.roomId === roomId && o.active);
  if (placement) {
    roomOverlays = roomOverlays.filter((o) => o.placement === placement);
  }
  return roomOverlays.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function rotateSponsorOverlays(roomId: string, placement: SponsorOverlayPlacement, limit = 1): LiveSponsorOverlay[] {
  const candidates = getSponsorOverlaysForRoom(roomId, placement);
  if (candidates.length <= 1) return candidates.slice(0, limit);

  // Deterministic time-based rotation using a 30s bucket size
  const bucketMs = 30 * 1000;
  const shift = Math.floor(Date.now() / bucketMs) % candidates.length;
  
  return [...candidates.slice(shift), ...candidates.slice(0, shift)].slice(0, limit);
}

export function getOutroMentions(roomId: string, limit = 3): LiveSponsorOverlay[] {
  return getSponsorOverlaysForRoom(roomId, "outro-mention").slice(0, limit);
}