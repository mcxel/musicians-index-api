export type ArchivedVisualRecord = {
  assetId: string;
  reason: string;
  archivedAt: number;
};

const archivedMap = new Map<string, ArchivedVisualRecord>();

export function archiveVisualAsset(assetId: string, reason: string): ArchivedVisualRecord {
  const next: ArchivedVisualRecord = {
    assetId,
    reason,
    archivedAt: Date.now(),
  };
  archivedMap.set(assetId, next);
  return next;
}

export function listArchivedVisualAssets(): ArchivedVisualRecord[] {
  return [...archivedMap.values()];
}
