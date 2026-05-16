export interface MagazineReadingSession {
  sessionId: string;
  readerId: string;
  slug: string;
  startedAtMs: number;
  lastTickAtMs: number;
  elapsedSeconds: number;
  scrollDepth: number;
  completionPct: number;
  audioPct: number;
}

const sessions = new Map<string, MagazineReadingSession>();

function id(input: { readerId: string; slug: string; startedAtMs: number }) {
  return `${input.readerId}:${input.slug}:${input.startedAtMs}`;
}

export function startMagazineReadingSession(readerId: string, slug: string, nowMs = Date.now()): MagazineReadingSession {
  const session: MagazineReadingSession = {
    sessionId: id({ readerId, slug, startedAtMs: nowMs }),
    readerId,
    slug,
    startedAtMs: nowMs,
    lastTickAtMs: nowMs,
    elapsedSeconds: 0,
    scrollDepth: 0,
    completionPct: 0,
    audioPct: 0,
  };

  sessions.set(session.sessionId, session);
  return session;
}

export function updateMagazineReadingSession(
  sessionId: string,
  patch: Partial<Pick<MagazineReadingSession, "scrollDepth" | "completionPct" | "audioPct">>,
  nowMs = Date.now(),
): MagazineReadingSession | null {
  const current = sessions.get(sessionId);
  if (!current) return null;

  const elapsedSeconds = current.elapsedSeconds + Math.max(0, Math.floor((nowMs - current.lastTickAtMs) / 1000));

  const next: MagazineReadingSession = {
    ...current,
    ...patch,
    elapsedSeconds,
    lastTickAtMs: nowMs,
  };

  sessions.set(sessionId, next);
  return next;
}

export function getMagazineReadingSession(sessionId: string): MagazineReadingSession | null {
  return sessions.get(sessionId) ?? null;
}
