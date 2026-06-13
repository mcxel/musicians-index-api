export interface CaptureSession {
  id: string;
  userId: string;
  roomId: string;
  status: 'starting' | 'live' | 'ended';
  streamUrl?: string;
}

class CaptureRegistry {
  private sessions: Map<string, CaptureSession> = new Map();

  startSession(session: CaptureSession) {
    this.sessions.set(session.id, session);
  }

  getSession(id: string) {
    return this.sessions.get(id);
  }

  endSession(id: string) {
    const session = this.sessions.get(id);
    if (session) {
      session.status = 'ended';
      this.sessions.set(id, session);
    }
  }

  getAllSessions() {
    return Array.from(this.sessions.values());
  }
}

export const captureRegistry = new CaptureRegistry();