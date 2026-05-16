export type VisualSlotStatus = "empty" | "queued" | "generating" | "approved" | "deployed" | "replaced";

export type VisualSlotAssetType =
  | "artist-profile-art"
  | "homepage-hero-art"
  | "battle-poster"
  | "venue-skin"
  | "ticket-art"
  | "nft-art"
  | "magazine-cover"
  | "article-thumbnail"
  | "sponsor-ad"
  | "billboard-art"
  | "avatar-clothing"
  | "avatar-prop"
  | "instrument"
  | "show-poster"
  | "prize-card";

export type VisualSlotRecord = {
  slotId: string;
  page: string;
  component: string;
  assetType: VisualSlotAssetType;
  owner: string;
  status: VisualSlotStatus;
  currentAssetId?: string;
  pendingAssetId?: string;
  replacementHistory: string[];
  updatedAt: number;
};

const visualSlots = new Map<string, VisualSlotRecord>();

export function registerSlot(
  input: Omit<VisualSlotRecord, "replacementHistory" | "updatedAt"> & { replacementHistory?: string[] }
): VisualSlotRecord {
  const slot: VisualSlotRecord = {
    ...input,
    replacementHistory: input.replacementHistory ?? [],
    updatedAt: Date.now(),
  };
  visualSlots.set(slot.slotId, slot);
  return slot;
}

export function getSlot(slotId: string): VisualSlotRecord | null {
  return visualSlots.get(slotId) ?? null;
}

export function listSlots(): VisualSlotRecord[] {
  return [...visualSlots.values()];
}

export function updateSlotStatus(slotId: string, status: VisualSlotStatus): VisualSlotRecord | null {
  const current = visualSlots.get(slotId);
  if (!current) return null;
  const next: VisualSlotRecord = { ...current, status, updatedAt: Date.now() };
  visualSlots.set(slotId, next);
  return next;
}

export function queueSlotReplacement(slotId: string, pendingAssetId: string): VisualSlotRecord | null {
  const current = visualSlots.get(slotId);
  if (!current) return null;
  const next: VisualSlotRecord = {
    ...current,
    status: "queued",
    pendingAssetId,
    updatedAt: Date.now(),
  };
  visualSlots.set(slotId, next);
  return next;
}

export function deploySlotAsset(slotId: string, assetId: string): VisualSlotRecord | null {
  const current = visualSlots.get(slotId);
  if (!current) return null;
  const history = current.currentAssetId ? [...current.replacementHistory, current.currentAssetId] : [...current.replacementHistory];
  const next: VisualSlotRecord = {
    ...current,
    status: "deployed",
    currentAssetId: assetId,
    pendingAssetId: undefined,
    replacementHistory: history,
    updatedAt: Date.now(),
  };
  visualSlots.set(slotId, next);
  return next;
}
