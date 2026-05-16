export type AudienceReactionRecord = {
  reactionId: string;
  roomId: string;
  applauseRate: number;
  cheerRate: number;
  retentionRate: number;
  reactionScore: number;
  status: 'flat' | 'engaged' | 'hype';
  updatedAt: number;
};

const audienceReactionMap = new Map<string, AudienceReactionRecord>();

export function evaluateAudienceReaction(input: {
  reactionId: string;
  roomId: string;
  applauseRate: number;
  cheerRate: number;
  retentionRate: number;
}): AudienceReactionRecord {
  const reactionScore = Math.round(
    input.applauseRate * 0.35 + input.cheerRate * 0.35 + input.retentionRate * 0.3
  );

  const status: AudienceReactionRecord['status'] =
    reactionScore >= 82 ? 'hype' : reactionScore >= 55 ? 'engaged' : 'flat';

  const next: AudienceReactionRecord = {
    ...input,
    reactionScore,
    status,
    updatedAt: Date.now(),
  };

  audienceReactionMap.set(next.reactionId, next);
  return next;
}

export function listAudienceReactionRecords(): AudienceReactionRecord[] {
  return [...audienceReactionMap.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}
