export type VisualUpgradeRecord = {
  assetId: string;
  reason: string;
  queuedAt: number;
  status: "queued" | "in-progress" | "completed";
  replacementAssetId?: string;
};

const upgradeMap = new Map<string, VisualUpgradeRecord>();

export function queueVisualUpgrade(assetId: string, reason: string): VisualUpgradeRecord {
  const next: VisualUpgradeRecord = {
    assetId,
    reason,
    queuedAt: Date.now(),
    status: "queued",
  };
  upgradeMap.set(assetId, next);
  return next;
}

export function setVisualUpgradeInProgress(assetId: string): VisualUpgradeRecord | null {
  const current = upgradeMap.get(assetId);
  if (!current) return null;
  const next: VisualUpgradeRecord = { ...current, status: "in-progress" };
  upgradeMap.set(assetId, next);
  return next;
}

export function completeVisualUpgrade(assetId: string, replacementAssetId: string): VisualUpgradeRecord | null {
  const current = upgradeMap.get(assetId);
  if (!current) return null;
  const next: VisualUpgradeRecord = {
    ...current,
    status: "completed",
    replacementAssetId,
  };
  upgradeMap.set(assetId, next);
  return next;
}

export function listVisualUpgrades(): VisualUpgradeRecord[] {
  return [...upgradeMap.values()];
}
