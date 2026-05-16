export type FaceConsistencyInput = {
  baselineFaceId: string;
  candidateFaceId: string;
  baselineStyleId: string;
  candidateStyleId: string;
  baselineWardrobeSetId: string;
  candidateWardrobeSetId: string;
};

export type FaceConsistencyReport = {
  consistencyScore: number;
  faceMatch: boolean;
  styleMatch: boolean;
  wardrobeMatch: boolean;
  driftLevel: 'none' | 'minor' | 'moderate' | 'severe';
};

function hashToScore(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash % 100);
}

export function evaluateFaceConsistency(input: FaceConsistencyInput): FaceConsistencyReport {
  const faceMatch = input.baselineFaceId === input.candidateFaceId;
  const styleMatch = input.baselineStyleId === input.candidateStyleId;
  const wardrobeMatch = input.baselineWardrobeSetId === input.candidateWardrobeSetId;

  const syntheticScore = hashToScore(
    `${input.baselineFaceId}|${input.candidateFaceId}|${input.baselineStyleId}|${input.candidateStyleId}`
  );

  const consistencyScore = Math.min(
    100,
    Math.round(
      (faceMatch ? 55 : 25) +
        (styleMatch ? 25 : 10) +
        (wardrobeMatch ? 20 : 8) +
        syntheticScore * 0.1
    )
  );

  let driftLevel: FaceConsistencyReport['driftLevel'] = 'severe';
  if (consistencyScore >= 95) driftLevel = 'none';
  else if (consistencyScore >= 80) driftLevel = 'minor';
  else if (consistencyScore >= 65) driftLevel = 'moderate';

  return {
    consistencyScore,
    faceMatch,
    styleMatch,
    wardrobeMatch,
    driftLevel,
  };
}

/**
 * Persistence layer for face consistency tracking.
 * Stores consistency records for audit and drift detection.
 */

export interface FaceConsistencyRecord {
  id: string;
  avatarId: string;
  generationId: string;
  report: FaceConsistencyReport;
  recordedAt: Date;
}

const consistencyRecords = new Map<string, FaceConsistencyRecord>();

/**
 * Record a consistency evaluation to memory (will be persisted to DB).
 */
export function recordConsistencyEvaluation(
  avatarId: string,
  generationId: string,
  report: FaceConsistencyReport
): FaceConsistencyRecord {
  const record: FaceConsistencyRecord = {
    id: `${avatarId}:${generationId}`,
    avatarId,
    generationId,
    report,
    recordedAt: new Date(),
  };
  consistencyRecords.set(record.id, record);
  return record;
}

/**
 * Get consistency history for an avatar.
 */
export function getConsistencyHistory(avatarId: string): FaceConsistencyRecord[] {
  return Array.from(consistencyRecords.values())
    .filter((r) => r.avatarId === avatarId)
    .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
}

/**
 * Detect drift from consistency records.
 */
export function detectDrift(avatarId: string): {
  hasDrift: boolean;
  severity: string;
  lastDriftAt?: Date;
} {
  const history = getConsistencyHistory(avatarId);
  const recent = history.slice(0, 5);

  const hasSevere = recent.some(
    (r) => r.report.driftLevel === 'severe' || r.report.driftLevel === 'moderate'
  );
  const hasMinor = recent.some((r) => r.report.driftLevel === 'minor');

  if (hasSevere) {
    return { hasDrift: true, severity: 'severe', lastDriftAt: recent[0]?.recordedAt };
  } else if (hasMinor) {
    return { hasDrift: true, severity: 'minor', lastDriftAt: recent[0]?.recordedAt };
  }

  return { hasDrift: false, severity: 'none' };
}
