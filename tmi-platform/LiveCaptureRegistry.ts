export type CaptureSource = 'camera' | 'screen' | 'daw' | 'external_media';
export type LobbyWallTarget = 'performers' | 'fans' | 'arena' | 'dance' | 'venue' | 'radio';

export interface CaptureSession {
  id: string;
  userId: string;
  source: CaptureSource;
  stream?: MediaStream;
  isActive: boolean;
  startedAt: Date;
  targetLobby: LobbyWallTarget;
}

class CaptureRegistry {
  private sessions: Map<string, CaptureSession> = new Map();

  /**
   * Invoked when a Fan, Performer, or DJ hits "Go Live" or "Share Screen"
   */
  async startCapture(userId: string, source: CaptureSource, role: 'fan' | 'performer' | 'venue'): Promise<CaptureSession> {
    // Determine routing destination automatically based on role/activity
    let targetLobby: LobbyWallTarget = 'fans';
    if (role === 'performer') targetLobby = 'performers';
    if (role === 'venue') targetLobby = 'venue';

    const session: CaptureSession = {
      id: `cap_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      source,
      isActive: true,
      startedAt: new Date(),
      targetLobby
    };
    
    this.sessions.set(session.id, session);
    
    // Dispatch immediately to the Lobby Wall feed providers
    window.dispatchEvent(new CustomEvent('LIVE_CAPTURE_STARTED', { detail: session }));
    return session;
  }

  stopCapture(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.sessions.delete(sessionId);
      window.dispatchEvent(new CustomEvent('LIVE_CAPTURE_STOPPED', { detail: sessionId }));
    }
  }
}

export const liveCaptureRegistry = new CaptureRegistry();