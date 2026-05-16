import { getIdentityLock, lockIdentity } from '@/lib/ai-visuals/IdentityLockEngine';
import { evaluateFaceConsistency } from '@/lib/avatars/FaceConsistencyEngine';

export type HostRole = 'host' | 'co-host' | 'dj' | 'julius' | 'big-ace';

export type HostIdentityRecord = {
  hostId: string;
  role: HostRole;
  displayName: string;
  identityLockId: string;
  consistencyScore: number;
  approved: boolean;
  createdAt: number;
  updatedAt: number;
};

const hostIdentities = new Map<string, HostIdentityRecord>();

export function registerHostIdentity(input: {
  hostId: string;
  role: HostRole;
  displayName: string;
  canonicalFaceId: string;
  canonicalStyleId: string;
  canonicalWardrobeSetId: string;
  motionProfileId: string;
}): HostIdentityRecord {
  const now = Date.now();
  const subjectType = input.role === 'dj' ? 'host' : input.role;

  const lock =
    getIdentityLock(subjectType as 'host' | 'co-host' | 'julius' | 'big-ace', input.hostId) ??
    lockIdentity({
      subjectType: subjectType as 'host' | 'co-host' | 'julius' | 'big-ace',
      subjectId: input.hostId,
      canonicalFaceId: input.canonicalFaceId,
      styleId: input.canonicalStyleId,
      wardrobeSetId: input.canonicalWardrobeSetId,
      motionProfileId: input.motionProfileId,
    });

  const consistency = evaluateFaceConsistency({
    baselineFaceId: lock.canonicalFaceId,
    candidateFaceId: input.canonicalFaceId,
    baselineStyleId: lock.styleId,
    candidateStyleId: input.canonicalStyleId,
    baselineWardrobeSetId: lock.wardrobeSetId,
    candidateWardrobeSetId: input.canonicalWardrobeSetId,
  });

  const existing = hostIdentities.get(input.hostId);
  const next: HostIdentityRecord = {
    hostId: input.hostId,
    role: input.role,
    displayName: input.displayName,
    identityLockId: lock.identityId,
    consistencyScore: consistency.consistencyScore,
    approved: consistency.consistencyScore >= 80,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  hostIdentities.set(input.hostId, next);
  return next;
}

export function listHostIdentities(): HostIdentityRecord[] {
  return [...hostIdentities.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}
