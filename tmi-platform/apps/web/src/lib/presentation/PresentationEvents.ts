/**
 * Semantic presentation events — television production language.
 * Battle/cypher/challenge runtimes emit these; PresentationDirector resolves Show Packages.
 */

export type PresentationSemanticEvent =
  | "BATTLE_START"
  | "BATTLE_INTRO"
  | "VS_REVEAL"
  | "PERFORMER_TURN"
  | "PERFORMANCE_START"
  | "VOTING_OPEN"
  | "VOTING_CLOSE"
  | "WINNER_DECLARED"
  | "ROUND_COMPLETE"
  | "SHOW_IDLE"
  | "CRITICAL_ALERT"
  | "CYPHER_START"
  | "CHALLENGE_START";

export interface PresentationEventPayload {
  roomId?: string;
  packageId?: string;
  /** Display labels only — never invent scores */
  leftLabel?: string;
  rightLabel?: string;
  performerLabel?: string;
  winnerLabel?: string;
  roundLabel?: string;
  cameraCue?: string;
  alertMessage?: string;
  /** Opaque passthrough for timeline customData */
  meta?: Record<string, unknown>;
}

export interface PresentationEventEnvelope {
  event: PresentationSemanticEvent;
  at: number;
  payload?: PresentationEventPayload;
}

export function createPresentationEvent(
  event: PresentationSemanticEvent,
  payload?: PresentationEventPayload
): PresentationEventEnvelope {
  return { event, at: Date.now(), payload };
}
