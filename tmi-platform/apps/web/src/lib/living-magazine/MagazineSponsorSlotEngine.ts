// MagazineSponsorSlotEngine
// Sponsor slots — branded content sections, NOT editorial.
// Clearly labeled and revenue-tracked.

export type SponsorSlotType = "branded-spread" | "side-rail" | "pull-quote" | "card-series" | "header-strip";

export interface SponsorSlot {
  id: string;
  type: SponsorSlotType;
  sponsorId: string;
  sponsorName: string;
  issueId?: string;
  spreadIndex?: number;
  label: string;            // e.g. "Presented by BeatVault"
  imageUrl?: string;
  linkUrl?: string;
  impressions: number;
  clicks: number;
  revenue: number;
  flatFee: number;          // what sponsor paid upfront
  accentColor: string;
}

const _slots = new Map<string, SponsorSlot>();

export function createSponsorSlot(
  id: string,
  type: SponsorSlotType,
  sponsorId: string,
  sponsorName: string,
  flatFee: number,
  options: Partial<SponsorSlot> = {},
): SponsorSlot {
  const slot: SponsorSlot = {
    id,
    type,
    sponsorId,
    sponsorName,
    label: `Presented by ${sponsorName}`,
    impressions: 0,
    clicks: 0,
    revenue: flatFee,
    flatFee,
    accentColor: "#FFD700",
    ...options,
  };
  _slots.set(id, slot);
  return slot;
}

export function recordSponsorImpression(slotId: string): void {
  const slot = _slots.get(slotId);
  if (!slot) return;
  _slots.set(slotId, { ...slot, impressions: slot.impressions + 1 });
}

export function recordSponsorClick(slotId: string): void {
  const slot = _slots.get(slotId);
  if (!slot) return;
  _slots.set(slotId, { ...slot, clicks: slot.clicks + 1 });
}

export function getSponsorSlotsBySponsor(sponsorId: string): SponsorSlot[] {
  return Array.from(_slots.values()).filter(s => s.sponsorId === sponsorId);
}

export function getSponsorSlot(id: string): SponsorSlot | null {
  return _slots.get(id) ?? null;
}
