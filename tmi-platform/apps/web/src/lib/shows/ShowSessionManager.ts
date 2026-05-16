/**
 * ShowSessionManager
 * Tracks who is present, when shows start/end, and session continuity.
 */

export type ShowParticipantRole = "contestant" | "judge" | "host" | "audience" | "sponsor";

export type ShowParticipant = {
  userId: string;
  displayName: string;
  role: ShowParticipantRole;
  joinedAtMs: number;
  lastActiveMs: number;
  online: boolean;
};

export type ShowSessionState =
  | "waiting"
  | "starting"
  | "live"
  | "intermission"
  | "finalizing"
  | "ended";

export type ShowSession = {
  sessionId: string;
  showId: string;
  state: ShowSessionState;
  startedAtMs: number | null;
  endedAtMs: number | null;
  durationMs: number | null;
  participants: Map<string, ShowParticipant>;
  maxAudience: number;
};

export class ShowSessionManager {
  private readonly sessions: Map<string, ShowSession> = new Map();

  createSession(showId: string, maxAudience: number = 1000): ShowSession {
    const sessionId = `session-${showId}-${Date.now()}`;
    const session: ShowSession = {
      sessionId,
      showId,
      state: "waiting",
      startedAtMs: null,
      endedAtMs: null,
      durationMs: null,
      participants: new Map(),
      maxAudience,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  start(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.state = "live";
    session.startedAtMs = Date.now();
  }

  intermission(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.state = "intermission";
  }

  finalize(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.state = "finalizing";
  }

  end(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.state = "ended";
    session.endedAtMs = Date.now();
    session.durationMs = session.startedAtMs ? session.endedAtMs - session.startedAtMs : null;
  }

  joinParticipant(sessionId: string, userId: string, displayName: string, role: ShowParticipantRole): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const isAudience = role === "audience";
    const audienceCount = [...session.participants.values()].filter((p) => p.role === "audience").length;

    if (isAudience && audienceCount >= session.maxAudience) {
      return false; // at capacity
    }

    session.participants.set(userId, {
      userId,
      displayName,
      role,
      joinedAtMs: Date.now(),
      lastActiveMs: Date.now(),
      online: true,
    });

    return true;
  }

  markActive(sessionId: string, userId: string): void {
    const participant = this.sessions.get(sessionId)?.participants.get(userId);
    if (participant) participant.lastActiveMs = Date.now();
  }

  removeParticipant(sessionId: string, userId: string): void {
    this.sessions.get(sessionId)?.participants.delete(userId);
  }

  markOffline(sessionId: string, userId: string): void {
    const participant = this.sessions.get(sessionId)?.participants.get(userId);
    if (participant) participant.online = false;
  }

  getSession(sessionId: string): ShowSession | null {
    return this.sessions.get(sessionId) ?? null;
  }

  getSessionByShowId(showId: string): ShowSession | null {
    for (const session of this.sessions.values()) {
      if (session.showId === showId && session.state !== "ended") return session;
    }
    return null;
  }

  getLiveCount(sessionId: string): number {
    return [...(this.sessions.get(sessionId)?.participants.values() ?? [])].filter((p) => p.online).length;
  }

  getParticipantsByRole(sessionId: string, role: ShowParticipantRole): ShowParticipant[] {
    return [...(this.sessions.get(sessionId)?.participants.values() ?? [])].filter((p) => p.role === role);
  }
}

export const showSessionManager = new ShowSessionManager();
