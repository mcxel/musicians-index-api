// MagazineAdSlotEngine
// Ad slot inventory — tracks available, sold, reserved, and rendered slots.

export type AdSlotStatus = "available" | "reserved" | "sold" | "rendered" | "expired";
export type AdSlotSize = "banner" | "half-page" | "full-page" | "strip" | "sidebar";

export interface AdSlot {
  id: string;
  issueId?: string;
  spreadIndex?: number;
  size: AdSlotSize;
  status: AdSlotStatus;
  advertiserId?: string;
  cpm: number;          // cost per mille (price per 1000 impressions)
  impressions: number;
  clicks: number;
  revenue: number;
  reservedAt?: string;
  expiresAt?: string;
  accentColor: string;
}

const _slots = new Map<string, AdSlot>();

export function createAdSlot(
  id: string,
  size: AdSlotSize,
  cpm: number,
  options: Partial<AdSlot> = {},
): AdSlot {
  const slot: AdSlot = {
    id,
    size,
    cpm,
    status: "available",
    impressions: 0,
    clicks: 0,
    revenue: 0,
    accentColor: "#FFD700",
    ...options,
  };
  _slots.set(id, slot);
  return slot;
}

export function reserveSlot(slotId: string, advertiserId: string): boolean {
  const slot = _slots.get(slotId);
  if (!slot || slot.status !== "available") return false;
  _slots.set(slotId, {
    ...slot,
    status: "reserved",
    advertiserId,
    reservedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  return true;
}

export function recordImpression(slotId: string): void {
  const slot = _slots.get(slotId);
  if (!slot) return;
  const impressions = slot.impressions + 1;
  const revenue = (impressions / 1000) * slot.cpm;
  _slots.set(slotId, { ...slot, impressions, revenue });
}

export function recordClick(slotId: string): void {
  const slot = _slots.get(slotId);
  if (!slot) return;
  _slots.set(slotId, { ...slot, clicks: slot.clicks + 1 });
}

export function getAvailableSlots(): AdSlot[] {
  return Array.from(_slots.values()).filter(s => s.status === "available");
}

export function getSlot(id: string): AdSlot | null {
  return _slots.get(id) ?? null;
}
