export interface ReplayClip {
  replayId: string;
  sourceEventId: string;
  url: string;
  startedAtMs: number;
  endedAtMs: number;
}

export interface ReplayEngine {
  createReplayClip(eventId: string, startedAtMs: number, endedAtMs: number): Promise<ReplayClip>;
}
