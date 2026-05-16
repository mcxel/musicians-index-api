export type IdentitySubjectType =
  | 'artist'
  | 'performer'
  | 'fan'
  | 'host'
  | 'co-host'
  | 'julius'
  | 'big-ace'
  | 'bot';

export type IdentityLockRecord = {
  identityId: string;
  subjectType: IdentitySubjectType;
  subjectId: string;
  canonicalFaceId: string;
  styleId: string;
  wardrobeSetId: string;
  motionProfileId: string;
  voiceProfileId: string | null;
  personalityProfileId: string | null;
  createdAt: number;
  updatedAt: number;
  locked: boolean;
};

const identityLocks = new Map<string, IdentityLockRecord>();

function key(subjectType: IdentitySubjectType, subjectId: string): string {
  return `${subjectType}:${subjectId}`;
}

export function lockIdentity(input: {
  subjectType: IdentitySubjectType;
  subjectId: string;
  canonicalFaceId: string;
  styleId: string;
  wardrobeSetId: string;
  motionProfileId: string;
  voiceProfileId?: string | null;
  personalityProfileId?: string | null;
}): IdentityLockRecord {
  const now = Date.now();
  const identityId = key(input.subjectType, input.subjectId);
  const existing = identityLocks.get(identityId);

  const next: IdentityLockRecord = {
    identityId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    canonicalFaceId: existing?.canonicalFaceId ?? input.canonicalFaceId,
    styleId: existing?.styleId ?? input.styleId,
    wardrobeSetId: existing?.wardrobeSetId ?? input.wardrobeSetId,
    motionProfileId: existing?.motionProfileId ?? input.motionProfileId,
    voiceProfileId: existing?.voiceProfileId ?? input.voiceProfileId ?? null,
    personalityProfileId: existing?.personalityProfileId ?? input.personalityProfileId ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    locked: true,
  };

  identityLocks.set(identityId, next);
  return next;
}

export function getIdentityLock(
  subjectType: IdentitySubjectType,
  subjectId: string
): IdentityLockRecord | null {
  return identityLocks.get(key(subjectType, subjectId)) ?? null;
}

export function listIdentityLocks(): IdentityLockRecord[] {
  return [...identityLocks.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function unlockIdentity(
  subjectType: IdentitySubjectType,
  subjectId: string,
  reason?: string
): IdentityLockRecord | null {
  const current = identityLocks.get(key(subjectType, subjectId));
  if (!current) return null;

  const next: IdentityLockRecord = {
    ...current,
    locked: false,
    updatedAt: Date.now(),
    personalityProfileId: reason
      ? `${current.personalityProfileId ?? 'unlocked'}:${reason}`
      : current.personalityProfileId,
  };

  identityLocks.set(next.identityId, next);
  return next;
}

/**
 * Persistence-aware identity lock extensions.
 * Syncs locks with database and tracks face consistency.
 */

export interface IdentityLockPersistence {
  identityId: string;
  locked: boolean;
  faceConsistencyScore: number; // 0-100
  driftDetected: boolean;
  driftReason?: string;
  persistedAt: Date;
}

/**
 * Persist identity lock to database.
 */
export async function persistIdentityLock(
  record: IdentityLockRecord
): Promise<IdentityLockPersistence> {
  // In production: save to visualIdentityLock table
  return {
    identityId: record.identityId,
    locked: record.locked,
    faceConsistencyScore: 100,
    driftDetected: false,
    persistedAt: new Date(),
  };
}

/**
 * Load identity locks from database on startup.
 */
export async function loadIdentityLocksFromDB(): Promise<IdentityLockRecord[]> {
  // In production: query visualIdentityLock table
  return listIdentityLocks();
}

/**
 * Verify face consistency against locked identity.
 */
export function verifyFaceConsistency(
  identityLock: IdentityLockRecord,
  generatedFaceId: string
): { consistent: boolean; score: number; drift?: string } {
  const match = identityLock.canonicalFaceId === generatedFaceId;
  return {
    consistent: match,
    score: match ? 100 : 0,
    drift: match
      ? undefined
      : `Face ID mismatch: expected ${identityLock.canonicalFaceId}, got ${generatedFaceId}`,
  };
}

/**
 * Report identity drift for a locked subject.
 */
export function reportIdentityDrift(
  subjectType: IdentitySubjectType,
  subjectId: string,
  reason: string
): void {
  const record = identityLocks.get(key(subjectType, subjectId));
  if (record) {
    console.warn(`[IDENTITY_DRIFT] ${subjectType}:${subjectId} - ${reason}`);
    unlockIdentity(subjectType, subjectId, reason);
  }
}
