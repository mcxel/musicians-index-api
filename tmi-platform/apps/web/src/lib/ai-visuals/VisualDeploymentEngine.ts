import { deploySlotAsset, getSlot, updateSlotStatus } from "./VisualSlotRegistry";
import { markDeployed } from "./AiVisualQueueEngine";

export type VisualDeploymentRecord = {
  deploymentId: string;
  slotId: string;
  assetId: string;
  version: number;
  deployedAt: number;
  rollbackFromAssetId?: string;
};

const deployments = new Map<string, VisualDeploymentRecord>();
const slotVersion = new Map<string, number>();

function id(): string {
  return `vdep_${Math.random().toString(36).slice(2, 11)}`;
}

export function deployAsset(slotId: string, assetId: string, queueRequestId?: string): VisualDeploymentRecord | null {
  const slot = getSlot(slotId);
  if (!slot) return null;

  const nextVersion = (slotVersion.get(slotId) ?? 0) + 1;
  slotVersion.set(slotId, nextVersion);

  const record: VisualDeploymentRecord = {
    deploymentId: id(),
    slotId,
    assetId,
    version: nextVersion,
    deployedAt: Date.now(),
  };

  deploySlotAsset(slotId, assetId);
  if (queueRequestId) markDeployed(queueRequestId, assetId);

  deployments.set(record.deploymentId, record);
  return record;
}

export function replaceAsset(slotId: string, assetId: string): VisualDeploymentRecord | null {
  const slot = getSlot(slotId);
  if (!slot) return null;

  const prev = slot.currentAssetId;
  const record = deployAsset(slotId, assetId);
  if (!record) return null;

  const replaced: VisualDeploymentRecord = {
    ...record,
    rollbackFromAssetId: prev,
  };
  deployments.set(replaced.deploymentId, replaced);
  return replaced;
}

export function rollbackAsset(slotId: string): VisualDeploymentRecord | null {
  const slot = getSlot(slotId);
  if (!slot) return null;
  const previousAsset = slot.replacementHistory[slot.replacementHistory.length - 1];
  if (!previousAsset) return null;

  updateSlotStatus(slotId, "replaced");
  return deployAsset(slotId, previousAsset);
}

export function versionAsset(slotId: string): number {
  return slotVersion.get(slotId) ?? 0;
}

export function listDeployments(): VisualDeploymentRecord[] {
  return [...deployments.values()].sort((a, b) => b.deployedAt - a.deployedAt);
}
