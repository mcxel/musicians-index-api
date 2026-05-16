export type CoHostSyncRecord = {
  syncId: string;
  primaryHostId: string;
  coHostId: string;
  callAndResponseWindowMs: number;
  reactionSyncWindowMs: number;
  driftToleranceMs: number;
  status: 'aligned' | 'warning' | 'out-of-sync';
  updatedAt: number;
};

const coHostSyncMap = new Map<string, CoHostSyncRecord>();

export function syncCoHosts(input: {
  syncId: string;
  primaryHostId: string;
  coHostId: string;
  callAndResponseWindowMs: number;
  reactionSyncWindowMs: number;
  driftToleranceMs: number;
}): CoHostSyncRecord {
  const drift = Math.abs(input.callAndResponseWindowMs - input.reactionSyncWindowMs);
  const status: CoHostSyncRecord['status'] =
    drift <= input.driftToleranceMs
      ? 'aligned'
      : drift <= input.driftToleranceMs * 2
      ? 'warning'
      : 'out-of-sync';

  const next: CoHostSyncRecord = {
    ...input,
    status,
    updatedAt: Date.now(),
  };

  coHostSyncMap.set(next.syncId, next);
  return next;
}

export function listCoHostSyncRecords(): CoHostSyncRecord[] {
  return [...coHostSyncMap.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}
