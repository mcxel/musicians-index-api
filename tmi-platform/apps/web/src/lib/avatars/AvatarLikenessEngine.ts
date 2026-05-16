import {
  getIdentityLock,
  lockIdentity,
  type IdentitySubjectType,
} from '@/lib/ai-visuals/IdentityLockEngine';
import {
  evaluateFaceConsistency,
  type FaceConsistencyReport,
} from '@/lib/avatars/FaceConsistencyEngine';

export type AvatarRenderVariant =
  | 'profile-avatar'
  | 'room-avatar'
  | 'seated-avatar'
  | 'reaction-avatar'
  | 'motion-portrait'
  | 'stage-avatar';

export type AvatarLikenessRecord = {
  avatarId: string;
  subjectType: Exclude<IdentitySubjectType, 'host' | 'co-host' | 'julius' | 'big-ace'>;
  subjectId: string;
  sourceImageRef: string;
  variant: AvatarRenderVariant;
  likenessScore: number;
  consistency: FaceConsistencyReport;
  createdAt: number;
};

const avatarRecords = new Map<string, AvatarLikenessRecord>();

function id(subjectType: string, subjectId: string, variant: AvatarRenderVariant): string {
  return `${subjectType}:${subjectId}:${variant}`;
}

export function createAvatarLikeness(input: {
  subjectType: Exclude<IdentitySubjectType, 'host' | 'co-host' | 'julius' | 'big-ace'>;
  subjectId: string;
  sourceImageRef: string;
  variant: AvatarRenderVariant;
  generatedFaceId: string;
  generatedStyleId: string;
  generatedWardrobeSetId: string;
}): AvatarLikenessRecord {
  const identity =
    getIdentityLock(input.subjectType, input.subjectId) ??
    lockIdentity({
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      canonicalFaceId: input.generatedFaceId,
      styleId: input.generatedStyleId,
      wardrobeSetId: input.generatedWardrobeSetId,
      motionProfileId: `${input.subjectType}-default-motion`,
    });

  const consistency = evaluateFaceConsistency({
    baselineFaceId: identity.canonicalFaceId,
    candidateFaceId: input.generatedFaceId,
    baselineStyleId: identity.styleId,
    candidateStyleId: input.generatedStyleId,
    baselineWardrobeSetId: identity.wardrobeSetId,
    candidateWardrobeSetId: input.generatedWardrobeSetId,
  });

  const avatarId = id(input.subjectType, input.subjectId, input.variant);
  const next: AvatarLikenessRecord = {
    avatarId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    sourceImageRef: input.sourceImageRef,
    variant: input.variant,
    likenessScore: consistency.consistencyScore,
    consistency,
    createdAt: Date.now(),
  };

  avatarRecords.set(avatarId, next);
  return next;
}

export function listAvatarLikenessRecords(): AvatarLikenessRecord[] {
  return [...avatarRecords.values()].sort((a, b) => b.createdAt - a.createdAt);
}
