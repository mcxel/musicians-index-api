export type TmiPerformerAudiencePerspectiveState = {
  performerId: string;
  roomId: string;
  audienceVisible: boolean;
  activeFanCount: number;
  reactionIntensity: number;
  updatedAt: number;
};

const STORE = new Map<string, TmiPerformerAudiencePerspectiveState>();

function key(performerId: string, roomId: string): string {
  return `${performerId}::${roomId}`;
}

export function setPerformerAudiencePerspective(
  performerId: string,
  roomId: string,
  partial: Partial<TmiPerformerAudiencePerspectiveState>,
): TmiPerformerAudiencePerspectiveState {
  const current = STORE.get(key(performerId, roomId));
  const next: TmiPerformerAudiencePerspectiveState = {
    performerId,
    roomId,
    audienceVisible: partial.audienceVisible ?? current?.audienceVisible ?? false,
    activeFanCount: partial.activeFanCount ?? current?.activeFanCount ?? 0,
    reactionIntensity: partial.reactionIntensity ?? current?.reactionIntensity ?? 0,
    updatedAt: Date.now(),
  };
  STORE.set(key(performerId, roomId), next);
  return next;
}

export function getPerformerAudiencePerspective(
  performerId: string,
  roomId: string,
): TmiPerformerAudiencePerspectiveState | undefined {
  return STORE.get(key(performerId, roomId));
}
