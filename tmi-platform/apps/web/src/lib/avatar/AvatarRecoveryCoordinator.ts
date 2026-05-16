/**
 * AvatarRecoveryCoordinator
 * Detects failed/degraded avatar assets and orchestrates recovery sequences.
 * Integrates with RuntimeAssetRegistry and AvatarReconstructionEngine.
 */

import { queryAssets, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { isReconstructable, getReconstructionInstructions } from "@/lib/registry/AssetLineageTracker";
import { queueReconstruction, type AvatarReconstructionSpec } from "@/lib/avatar/AvatarReconstructionEngine";

export type RecoveryAction = "reconstruct" | "degrade" | "placeholder" | "evict" | "escalate";

export interface AvatarRecoveryRecord {
  entityId: string;
  assetId: string;
  triggeredAt: number;
  action: RecoveryAction;
  reason: string;
  resolved: boolean;
  resolvedAt: number | null;
  attempt: number;
}

export interface RecoveryCoordinatorState {
  activeRecoveries: AvatarRecoveryRecord[];
  completedRecoveries: AvatarRecoveryRecord[];
  totalAttempted: number;
  totalResolved: number;
}

const MAX_ATTEMPTS = 3;
const MAX_LOG = 200;

const recoveryLog: AvatarRecoveryRecord[] = [];
const activeByEntity = new Map<string, AvatarRecoveryRecord>();
const attemptCount = new Map<string, number>();

type RecoveryListener = (record: AvatarRecoveryRecord) => void;
const recoveryListeners = new Set<RecoveryListener>();

function notify(record: AvatarRecoveryRecord): void {
  recoveryListeners.forEach(l => l(record));
}

export function triggerAvatarRecovery(entityId: string, assetId: string, reason: string): AvatarRecoveryRecord {
  const attempts = (attemptCount.get(entityId) ?? 0) + 1;
  attemptCount.set(entityId, attempts);

  let action: RecoveryAction;
  if (attempts > MAX_ATTEMPTS) {
    action = "placeholder";
  } else if (isReconstructable(assetId)) {
    action = "reconstruct";
  } else {
    action = "degrade";
  }

  const record: AvatarRecoveryRecord = {
    entityId, assetId, triggeredAt: Date.now(),
    action, reason, resolved: false, resolvedAt: null, attempt: attempts,
  };

  activeByEntity.set(entityId, record);
  recoveryLog.unshift(record);
  if (recoveryLog.length > MAX_LOG) recoveryLog.splice(MAX_LOG);
  notify(record);

  void executeRecovery(record);
  return record;
}

async function executeRecovery(record: AvatarRecoveryRecord): Promise<void> {
  const { entityId, assetId, action } = record;

  if (action === "reconstruct") {
    const instructions = getReconstructionInstructions(assetId);
    let spec: AvatarReconstructionSpec;

    try {
      spec = instructions ? JSON.parse(instructions) as AvatarReconstructionSpec : {
        entityId, entityType: "avatar", displayName: entityId,
        targetQuality: "reduced", includeMotionRig: false,
        includeExpressions: true, includeAccessories: false,
        backgroundVariant: null, lightingPreset: null,
      };
    } catch {
      spec = {
        entityId, entityType: "avatar", displayName: entityId,
        targetQuality: "reduced", includeMotionRig: false,
        includeExpressions: true, includeAccessories: false,
        backgroundVariant: null, lightingPreset: null,
      };
    }

    queueReconstruction(spec);
  } else if (action === "degrade") {
    setHydrationStatus(assetId, "degraded");
  } else if (action === "placeholder") {
    setHydrationStatus(assetId, "degraded");
  }

  const resolved: AvatarRecoveryRecord = { ...record, resolved: true, resolvedAt: Date.now() };
  activeByEntity.delete(entityId);
  const idx = recoveryLog.findIndex(r => r.entityId === entityId && r.triggeredAt === record.triggeredAt);
  if (idx >= 0) recoveryLog[idx] = resolved;
  notify(resolved);
}

export function scanForFailedAvatars(): AvatarRecoveryRecord[] {
  const failed = queryAssets({ kind: "avatar", status: "failed" });
  const degraded = queryAssets({ kind: "avatar", status: "degraded" });
  const triggered: AvatarRecoveryRecord[] = [];

  for (const asset of [...failed, ...degraded]) {
    if (!activeByEntity.has(asset.ownerId) && asset.recoveryEligible) {
      triggered.push(triggerAvatarRecovery(asset.ownerId, asset.assetId, `Status: ${asset.hydrationStatus}`));
    }
  }
  return triggered;
}

export function getRecoveryState(): RecoveryCoordinatorState {
  return {
    activeRecoveries: [...activeByEntity.values()],
    completedRecoveries: recoveryLog.filter(r => r.resolved).slice(0, 50),
    totalAttempted: recoveryLog.length,
    totalResolved: recoveryLog.filter(r => r.resolved).length,
  };
}

export function subscribeToAvatarRecovery(listener: RecoveryListener): () => void {
  recoveryListeners.add(listener);
  return () => recoveryListeners.delete(listener);
}

export function resetRecoveryAttempts(entityId: string): void {
  attemptCount.delete(entityId);
}
