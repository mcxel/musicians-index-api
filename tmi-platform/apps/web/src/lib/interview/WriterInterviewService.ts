/**
 * WriterInterviewService
 * Manages writer interview session state server-side.
 * Sessions: PREP → WAITING_FOR_GUEST → CONNECTED → RECORDING → PAUSED → ENDED → PROCESSING → READY_FOR_REVIEW → PUBLISHED
 */

export type InterviewSessionStatus =
  | "PREP"
  | "WAITING_FOR_GUEST"
  | "CONNECTED"
  | "RECORDING"
  | "PAUSED"
  | "ENDED"
  | "PROCESSING"
  | "READY_FOR_REVIEW"
  | "PUBLISHED";

export interface InterviewSession {
  id: string;
  writerId: string;
  guestName: string;
  guestEmail: string | null;
  articleTargetSlug: string | null;
  title: string;
  status: InterviewSessionStatus;
  consentConfirmed: boolean;
  recordingStartedAt: number | null;
  recordingEndedAt: number | null;
  durationSeconds: number;
  notes: string;
  inviteToken: string;
  createdAt: number;
  updatedAt: number;
}

// In-memory store (swap for Prisma in production)
const sessions = new Map<string, InterviewSession>();

function generateId(): string {
  return `interview_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateToken(): string {
  return `itk_${Math.random().toString(36).slice(2, 18)}_${Math.random().toString(36).slice(2, 10)}`;
}

// Valid status transitions
const VALID_TRANSITIONS: Record<InterviewSessionStatus, InterviewSessionStatus[]> = {
  PREP:              ["WAITING_FOR_GUEST"],
  WAITING_FOR_GUEST: ["CONNECTED", "PREP"],
  CONNECTED:         ["RECORDING", "ENDED"],
  RECORDING:         ["PAUSED", "ENDED"],
  PAUSED:            ["RECORDING", "ENDED"],
  ENDED:             ["PROCESSING"],
  PROCESSING:        ["READY_FOR_REVIEW"],
  READY_FOR_REVIEW:  ["PUBLISHED", "ENDED"],
  PUBLISHED:         [],
};

export const WriterInterviewService = {
  createSession(params: {
    writerId: string;
    guestName: string;
    guestEmail?: string;
    articleTargetSlug?: string;
    title: string;
  }): InterviewSession {
    const session: InterviewSession = {
      id: generateId(),
      writerId: params.writerId,
      guestName: params.guestName,
      guestEmail: params.guestEmail ?? null,
      articleTargetSlug: params.articleTargetSlug ?? null,
      title: params.title,
      status: "PREP",
      consentConfirmed: false,
      recordingStartedAt: null,
      recordingEndedAt: null,
      durationSeconds: 0,
      notes: "",
      inviteToken: generateToken(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    sessions.set(session.id, session);
    return session;
  },

  getSession(id: string): InterviewSession | null {
    return sessions.get(id) ?? null;
  },

  getSessionsByWriter(writerId: string): InterviewSession[] {
    return Array.from(sessions.values())
      .filter((s) => s.writerId === writerId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  transitionStatus(
    id: string,
    targetStatus: InterviewSessionStatus,
  ): { ok: true; session: InterviewSession } | { ok: false; error: string } {
    const session = sessions.get(id);
    if (!session) return { ok: false, error: "Session not found" };

    const allowed = VALID_TRANSITIONS[session.status];
    if (!allowed.includes(targetStatus)) {
      return {
        ok: false,
        error: `Cannot transition from ${session.status} to ${targetStatus}`,
      };
    }

    const now = Date.now();
    const updated: InterviewSession = { ...session, status: targetStatus, updatedAt: now };

    if (targetStatus === "RECORDING" && session.recordingStartedAt == null) {
      updated.recordingStartedAt = now;
    }
    if ((targetStatus === "ENDED" || targetStatus === "PAUSED") && session.status === "RECORDING" && session.recordingStartedAt) {
      updated.recordingEndedAt = now;
      updated.durationSeconds = session.durationSeconds + Math.floor((now - session.recordingStartedAt) / 1000);
    }
    if (targetStatus === "PAUSED" && session.status === "RECORDING") {
      // Re-opens recording later; clear start timestamp so next RECORDING resets it
      updated.recordingStartedAt = null;
    }

    sessions.set(id, updated);
    return { ok: true, session: updated };
  },

  confirmConsent(id: string): { ok: boolean; error?: string } {
    const session = sessions.get(id);
    if (!session) return { ok: false, error: "Session not found" };
    sessions.set(id, { ...session, consentConfirmed: true, updatedAt: Date.now() });
    return { ok: true };
  },

  saveNotes(id: string, notes: string): { ok: boolean; error?: string } {
    const session = sessions.get(id);
    if (!session) return { ok: false, error: "Session not found" };
    sessions.set(id, { ...session, notes, updatedAt: Date.now() });
    return { ok: true };
  },

  linkArticle(id: string, articleTargetSlug: string): { ok: boolean; error?: string } {
    const session = sessions.get(id);
    if (!session) return { ok: false, error: "Session not found" };
    sessions.set(id, { ...session, articleTargetSlug, updatedAt: Date.now() });
    return { ok: true };
  },

  deleteSession(id: string, writerId: string): { ok: boolean; error?: string } {
    const session = sessions.get(id);
    if (!session) return { ok: false, error: "Session not found" };
    if (session.writerId !== writerId) return { ok: false, error: "Unauthorized" };
    if (session.status === "RECORDING") return { ok: false, error: "Cannot delete active recording" };
    sessions.delete(id);
    return { ok: true };
  },
};
