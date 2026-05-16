export type RotationMode = "weighted" | "scheduled" | "manual";
export type RotationAsset = {
  assetId: string;
  weight: number;
  startsAt?: number;
  endsAt?: number;
};

export type RotationSlot = {
  slotId: string;
  mode: RotationMode;
  assets: RotationAsset[];
  manualOverrideAssetId?: string;
};

const rotationMap = new Map<string, RotationSlot>();

export function registerRotationSlot(slot: RotationSlot): RotationSlot {
  rotationMap.set(slot.slotId, slot);
  return slot;
}

export function getRotationSlot(slotId: string): RotationSlot | null {
  return rotationMap.get(slotId) ?? null;
}

function pickWeighted(assets: RotationAsset[]): RotationAsset | null {
  const sum = assets.reduce((acc, a) => acc + Math.max(1, a.weight), 0);
  if (sum <= 0 || assets.length === 0) return null;
  let cursor = Math.random() * sum;
  for (const asset of assets) {
    cursor -= Math.max(1, asset.weight);
    if (cursor <= 0) return asset;
  }
  return assets[assets.length - 1] ?? null;
}

function pickScheduled(assets: RotationAsset[], now: number): RotationAsset | null {
  const active = assets.filter((a) => {
    if (a.startsAt && now < a.startsAt) return false;
    if (a.endsAt && now > a.endsAt) return false;
    return true;
  });
  return active[0] ?? null;
}

export function resolveRotationAsset(slotId: string, now = Date.now()): string | null {
  const slot = rotationMap.get(slotId);
  if (!slot) return null;

  if (slot.manualOverrideAssetId) return slot.manualOverrideAssetId;

  if (slot.mode === "scheduled") {
    return pickScheduled(slot.assets, now)?.assetId ?? null;
  }

  if (slot.mode === "weighted") {
    return pickWeighted(slot.assets)?.assetId ?? null;
  }

  return slot.assets[0]?.assetId ?? null;
}

export function setManualOverride(slotId: string, assetId?: string): RotationSlot | null {
  const slot = rotationMap.get(slotId);
  if (!slot) return null;
  const next: RotationSlot = { ...slot, manualOverrideAssetId: assetId };
  rotationMap.set(slotId, next);
  return next;
}
