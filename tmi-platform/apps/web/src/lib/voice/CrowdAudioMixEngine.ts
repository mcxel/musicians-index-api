// CrowdAudioMixEngine.ts
// Gates crowd audio for key show moments. Bebo panel logic included.

import type { RoomVoiceEngine } from "./RoomVoiceEngine";

export type CrowdMoment =
  | "YAY"
  | "BOO"
  | "APPLAUSE"
  | "COMEBACK"
  | "WINNER"
  | "BEBO_PULL"       // Bebo yanks someone off stage → crowd boos open
  | "BEBO_RETURN"     // Bebo brings someone back → crowd yays open
  | "NONE";

export interface CrowdAudioWindow {
  moment: CrowdMoment;
  openedAt: number;
  durationMs: number; // 0 = stays open until explicitly closed
  openedBy: string;
  audienceUnmuted: boolean;
}

// How long each crowd moment stays open (ms). 0 = manual close required.
const MOMENT_DURATION_MS: Record<CrowdMoment, number> = {
  YAY: 4000,
  BOO: 3500,
  APPLAUSE: 6000,
  COMEBACK: 5000,
  WINNER: 8000,
  BEBO_PULL: 3500,
  BEBO_RETURN: 5000,
  NONE: 0,
};

// Whether each moment should unmute the crowd
const MOMENT_OPENS_CROWD: Record<CrowdMoment, boolean> = {
  YAY: true,
  BOO: true,
  APPLAUSE: true,
  COMEBACK: true,
  WINNER: true,
  BEBO_PULL: true,  // boos become audible when Bebo pulls
  BEBO_RETURN: true, // yays become audible when Bebo brings back
  NONE: false,
};

export class CrowdAudioMixEngine {
  private activeWindows: Map<string, CrowdAudioWindow> = new Map();
  private closeTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  /**
   * Open a crowd audio window for a moment type.
   * If the room engine is provided, unmute AUDIENCE participants.
   */
  openCrowdWindow(
    roomId: string,
    moment: CrowdMoment,
    openedBy: string,
    engine?: RoomVoiceEngine
  ): CrowdAudioWindow {
    // Close any existing window first
    this.closeCrowdWindow(roomId, engine);

    const window: CrowdAudioWindow = {
      moment,
      openedAt: Date.now(),
      durationMs: MOMENT_DURATION_MS[moment],
      openedBy,
      audienceUnmuted: MOMENT_OPENS_CROWD[moment],
    };

    this.activeWindows.set(roomId, window);

    if (MOMENT_OPENS_CROWD[moment] && engine) {
      for (const p of engine.getParticipants()) {
        if (p.role === "AUDIENCE") {
          engine.systemUnmute(p.id);
        }
      }
    }

    // Auto-close after duration if set
    if (window.durationMs > 0) {
      const timer = setTimeout(() => {
        this.closeCrowdWindow(roomId, engine);
      }, window.durationMs);
      this.closeTimers.set(roomId, timer);
    }

    return window;
  }

  /**
   * Explicitly close the crowd window and re-mute audience if in LIVE_SHOW.
   */
  closeCrowdWindow(roomId: string, engine?: RoomVoiceEngine): void {
    const existing = this.activeWindows.get(roomId);
    if (!existing) return;

    this.activeWindows.delete(roomId);

    const timer = this.closeTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.closeTimers.delete(roomId);
    }

    if (engine && engine.getState() === "LIVE_SHOW") {
      for (const p of engine.getParticipants()) {
        if (p.role === "AUDIENCE") {
          engine.systemMute(p.id);
        }
      }
    }
  }

  isCrowdOpen(roomId: string): boolean {
    return this.activeWindows.has(roomId);
  }

  getActiveMoment(roomId: string): CrowdMoment {
    return this.activeWindows.get(roomId)?.moment ?? "NONE";
  }

  getWindow(roomId: string): CrowdAudioWindow | null {
    return this.activeWindows.get(roomId) ?? null;
  }

  /**
   * Bebo-specific: pull a contestant off stage.
   * Opens BOO window automatically.
   */
  beboPull(roomId: string, openedBy: string, engine?: RoomVoiceEngine): CrowdAudioWindow {
    return this.openCrowdWindow(roomId, "BEBO_PULL", openedBy, engine);
  }

  /**
   * Bebo-specific: bring a contestant back on stage.
   * Opens YAY/cheer window automatically.
   */
  beboReturn(roomId: string, openedBy: string, engine?: RoomVoiceEngine): CrowdAudioWindow {
    return this.openCrowdWindow(roomId, "BEBO_RETURN", openedBy, engine);
  }

  /**
   * Pump performer confidence — open APPLAUSE window.
   */
  pumpConfidence(roomId: string, openedBy: string, engine?: RoomVoiceEngine): CrowdAudioWindow {
    return this.openCrowdWindow(roomId, "APPLAUSE", openedBy, engine);
  }
}
