export type AdSlotPosition = "stage-left" | "stage-right" | "overhead" | "entrance" | "vip-lounge" | "floor-side";
export type AdFormat = "banner" | "video-loop" | "artist-promo" | "sponsor-logo" | "event-announce";

export interface AdWallSlot {
  slotId: string;
  venueId: string;
  position: AdSlotPosition;
  format: AdFormat;
  sponsorId?: string;
  artistId?: string;
  title: string;
  imageRef?: string;
  videoRef?: string;
  ctaRoute?: string;
  durationSec: number;
  rotatesWith: string[];
  impressions: number;
  activeSince: string;
  active: boolean;
}

const walls = new Map<string, AdWallSlot[]>();

function gen(): string {
  return `adslot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function activateAdSlot(
  venueId: string,
  opts: Omit<AdWallSlot, "slotId" | "impressions" | "activeSince" | "active">,
): AdWallSlot {
  const slot: AdWallSlot = {
    slotId: gen(),
    impressions: 0,
    activeSince: new Date().toISOString(),
    active: true,
    ...opts,
  };
  const list = walls.get(venueId) ?? [];
  list.push(slot);
  walls.set(venueId, list);
  return slot;
}

export function recordImpression(venueId: string, slotId: string): void {
  const list = walls.get(venueId) ?? [];
  const idx = list.findIndex((s) => s.slotId === slotId);
  if (idx >= 0) list[idx] = { ...list[idx], impressions: list[idx].impressions + 1 };
}

export function getActiveSlots(venueId: string, position?: AdSlotPosition): AdWallSlot[] {
  const list = walls.get(venueId) ?? [];
  return list.filter((s) => s.active && (!position || s.position === position));
}

export function deactivateSlot(venueId: string, slotId: string): void {
  const list = walls.get(venueId) ?? [];
  const idx = list.findIndex((s) => s.slotId === slotId);
  if (idx >= 0) list[idx] = { ...list[idx], active: false };
}

export function getImpressionCount(venueId: string): number {
  return (walls.get(venueId) ?? []).reduce((s, slot) => s + slot.impressions, 0);
}

export function clearAdWall(venueId: string): void {
  walls.delete(venueId);
}

export function injectSponsorPromo(
  venueId: string,
  sponsorId: string,
  title: string,
  position: AdSlotPosition = "stage-left",
  ctaRoute?: string,
): AdWallSlot {
  return activateAdSlot(venueId, {
    venueId,
    position,
    format: "sponsor-logo",
    sponsorId,
    title,
    ctaRoute,
    durationSec: 30,
    rotatesWith: [],
  });
}
