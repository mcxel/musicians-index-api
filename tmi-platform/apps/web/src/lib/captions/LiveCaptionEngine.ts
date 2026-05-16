import { addCaption, enableCaptions, type CaptionEntry } from "./ClosedCaptionEngine";

export interface LiveCaptionSession {
  sessionId: string;
  streamId: string;
  language: string;
  isActive: boolean;
  startedAt: string;
  captionCount: number;
}

const sessions = new Map<string, LiveCaptionSession>();

export function startLiveCaptionSession(streamId: string, language = "en"): LiveCaptionSession {
  enableCaptions(streamId);
  const session: LiveCaptionSession = {
    sessionId: `lc_${Date.now()}`,
    streamId,
    language,
    isActive: true,
    startedAt: new Date().toISOString(),
    captionCount: 0,
  };
  sessions.set(streamId, session);
  return session;
}

export function pushLiveCaption(
  streamId: string,
  text: string,
  durationMs = 3000,
  speaker?: string,
): CaptionEntry {
  const session = sessions.get(streamId);
  const now = Date.now();
  const entry = addCaption(streamId, text, now, now + durationMs, speaker);
  if (session) {
    session.captionCount++;
    sessions.set(streamId, session);
  }
  return entry;
}

export function stopLiveCaptionSession(streamId: string): void {
  const session = sessions.get(streamId);
  if (session) {
    session.isActive = false;
    sessions.set(streamId, session);
  }
}

export function getLiveCaptionSession(streamId: string): LiveCaptionSession | null {
  return sessions.get(streamId) ?? null;
}

export function isLiveCaptionActive(streamId: string): boolean {
  return sessions.get(streamId)?.isActive ?? false;
}
