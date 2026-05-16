export type RetiredVisualRecord = {
  assetId: string;
  retiredAt: number;
  reason: string;
  hardDeleted: boolean;
};

const retiredMap = new Map<string, RetiredVisualRecord>();

export function retireVisualAsset(assetId: string, reason: string): RetiredVisualRecord {
  const next: RetiredVisualRecord = {
    assetId,
    reason,
    retiredAt: Date.now(),
    hardDeleted: false,
  };
  retiredMap.set(assetId, next);
  return next;
}

export function deleteRetiredVisualAsset(assetId: string, reason = "unrecoverable"): RetiredVisualRecord {
  const next: RetiredVisualRecord = {
    assetId,
    reason,
    retiredAt: Date.now(),
    hardDeleted: true,
  };
  retiredMap.set(assetId, next);
  return next;
}

export function listRetiredVisualAssets(): RetiredVisualRecord[] {
  return [...retiredMap.values()];
}

export function listStorageCleanupCandidates(): string[] {
  return listRetiredVisualAssets()
    .filter((entry) => entry.hardDeleted)
    .map((entry) => entry.assetId);
}
