import { getMagazineReadingSession } from "@/lib/magazine/MagazineReadingTimer";

export interface ReaderProgressSnapshot {
  completionPct: number;
  scrollDepth: number;
  audioPct: number;
  elapsedSeconds: number;
}

export function getReaderProgress(sessionId: string): ReaderProgressSnapshot | null {
  const session = getMagazineReadingSession(sessionId);
  if (!session) return null;

  return {
    completionPct: session.completionPct,
    scrollDepth: session.scrollDepth,
    audioPct: session.audioPct,
    elapsedSeconds: session.elapsedSeconds,
  };
}
