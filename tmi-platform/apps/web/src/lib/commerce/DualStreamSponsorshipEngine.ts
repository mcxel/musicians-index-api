/**
 * DualStreamSponsorshipEngine — house sponsors + performer-hunted brands.
 *
 * House: TMI platform overlays (Command Center HOUSE_SPONSORS) + Rule 12
 *   getAdSlotForZone fallback (Paid → Platform → Ad network → Advertise CTA).
 * Hunted: PerformerSponsorRegistry (prisma-backed) — performer toggles approved
 *   campaigns onto their live overlay. Empty when none approved (Rule 20).
 *
 * Never invents Coca-Cola / fake brand deals.
 */

import {
  getAdSlotForZone,
  getActiveSponsorForZone,
  type AdSlotDescriptor,
  type ActiveSponsorDisplay,
} from "@/lib/commerce/SponsorRegistry";
import { PerformerSponsorRegistry } from "@/lib/registries/PerformerSponsorRegistry";
import {
  registerLiveSponsor,
  getSponsorOverlaysForRoom,
  type LiveSponsorOverlay,
} from "@/lib/live/LiveSponsorOverlayEngine";
import { HOUSE_SPONSORS, type HouseSponsor } from "@/lib/commerce/HouseSponsorCanon";

export type { HouseSponsor };
export { HOUSE_SPONSORS };

export type DualStreamLane = "house" | "hunted";

export type DualStreamSponsor = {
  id: string;
  name: string;
  tagline: string;
  lane: DualStreamLane;
  href?: string;
  accent?: string;
  logoUrl?: string;
  /** Performer toggled this hunted campaign onto the live overlay. */
  liveEnabled: boolean;
  relationId?: string;
};

/** In-memory performer toggle map: `${performerId}:${sponsorId}` → enabled */
const huntedLiveToggles = new Map<string, boolean>();

function toggleKey(performerId: string, sponsorId: string): string {
  return `${performerId}:${sponsorId}`;
}

export function setHuntedSponsorLive(
  performerId: string,
  sponsorId: string,
  enabled: boolean,
): void {
  huntedLiveToggles.set(toggleKey(performerId, sponsorId), enabled);
}

export function isHuntedSponsorLive(performerId: string, sponsorId: string): boolean {
  return huntedLiveToggles.get(toggleKey(performerId, sponsorId)) === true;
}

export function listHouseSponsors(): DualStreamSponsor[] {
  return HOUSE_SPONSORS.map((h: HouseSponsor) => ({
    id: h.id,
    name: h.name,
    tagline: h.tagline,
    lane: "house" as const,
    href: h.href,
    accent: h.accent,
    liveEnabled: true, // house always available when performer goes live
  }));
}

export async function listHuntedSponsors(performerId: string): Promise<DualStreamSponsor[]> {
  if (!performerId?.trim()) return [];
  const rows = await PerformerSponsorRegistry.listByPerformer(performerId);
  return rows
    .filter((r) => r.status === "active")
    .map((r) => ({
      id: r.sponsorId,
      name: r.sponsorName,
      tagline: `${r.tier} · $${r.monthlyAmountUsd}/mo`,
      lane: "hunted" as const,
      liveEnabled: isHuntedSponsorLive(performerId, r.sponsorId),
      relationId: r.relationId,
    }));
}

export async function listDualStreamForPerformer(performerId: string): Promise<{
  house: DualStreamSponsor[];
  hunted: DualStreamSponsor[];
}> {
  const hunted = await listHuntedSponsors(performerId);
  return { house: listHouseSponsors(), hunted };
}

/** Rule 12 house ad slot for a live zone — never empty descriptor. */
export function resolveHouseAdSlot(zone: string): AdSlotDescriptor {
  return getAdSlotForZone(zone);
}

export function resolvePaidHouseSponsor(zone: string): ActiveSponsorDisplay | null {
  return getActiveSponsorForZone(zone);
}

/**
 * Register house + toggled hunted sponsors onto LiveSponsorOverlayEngine for a room.
 * Returns overlays currently active (may be house-only).
 */
export async function syncLiveRoomSponsors(input: {
  roomId: string;
  performerId?: string | null;
}): Promise<LiveSponsorOverlay[]> {
  const { roomId, performerId } = input;

  // House lane — always register TMI house sponsors (platform promos, not fake brands)
  for (const house of listHouseSponsors()) {
    registerLiveSponsor({
      roomId,
      sponsorId: house.id,
      sponsorName: house.name,
      assetUrl: house.href,
      totalSpendCents: 0,
      campaignPerformanceScore: 50,
      activeCampaignsCount: 1,
      artistSponsorshipCount: 0,
      merchantProductCount: 0,
    });
  }

  // Paid zone sponsor if any real ACTIVE_SPONSOR_ZONES entry exists
  const paid = getActiveSponsorForZone(`live-room-${roomId}`);
  if (paid) {
    registerLiveSponsor({
      roomId,
      sponsorId: paid.sponsorId,
      sponsorName: paid.name,
      assetUrl: paid.logoUrl,
      totalSpendCents: 10000,
      campaignPerformanceScore: 80,
      activeCampaignsCount: 1,
      artistSponsorshipCount: 1,
      merchantProductCount: 0,
    });
  }

  if (performerId) {
    const hunted = await listHuntedSponsors(performerId);
    for (const h of hunted.filter((s) => s.liveEnabled)) {
      registerLiveSponsor({
        roomId,
        sponsorId: h.id,
        sponsorName: h.name,
        totalSpendCents: 5000,
        campaignPerformanceScore: 60,
        activeCampaignsCount: 1,
        artistSponsorshipCount: 1,
        merchantProductCount: 0,
      });
    }
  }

  return getSponsorOverlaysForRoom(roomId);
}

export function getLiveDualStreamSummary(roomId: string): {
  overlays: LiveSponsorOverlay[];
  houseCount: number;
  huntedCount: number;
} {
  const overlays = getSponsorOverlaysForRoom(roomId);
  const houseIds = new Set(HOUSE_SPONSORS.map((h) => h.id));
  const houseCount = overlays.filter((o) => houseIds.has(o.sponsorId)).length;
  const huntedCount = overlays.filter((o) => !houseIds.has(o.sponsorId)).length;
  return { overlays, houseCount, huntedCount };
}
