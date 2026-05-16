// VoiceFocusEngine.ts
// Focus one person by name: highlight them, open their mic, mute surrounding crowd.

import type { RoomVoiceEngine, VoiceParticipant } from "./RoomVoiceEngine";

export interface FocusTarget {
  participantId: string;
  displayName: string;
  focusedAt: number;
  focusedBy: string; // HOST or PERFORMER id
}

export interface FocusSession {
  roomId: string;
  activeFocus: FocusTarget | null;
  previousFocusIds: string[]; // history for this session
  crowdMutedDuringFocus: boolean;
}

export class VoiceFocusEngine {
  private sessions: Map<string, FocusSession> = new Map();

  private getOrCreateSession(roomId: string): FocusSession {
    if (!this.sessions.has(roomId)) {
      this.sessions.set(roomId, {
        roomId,
        activeFocus: null,
        previousFocusIds: [],
        crowdMutedDuringFocus: true,
      });
    }
    return this.sessions.get(roomId)!;
  }

  /**
   * Focus a participant by name or id.
   * Mutes all AUDIENCE participants except the focused one.
   * Returns the resolved focus target, or null if not found.
   */
  focusPerson(
    engine: RoomVoiceEngine,
    identifier: string, // displayName or participantId
    focusedBy: string
  ): FocusTarget | null {
    const participants = engine.getParticipants();

    const target =
      participants.find((p) => p.id === identifier) ??
      participants.find(
        (p) => p.displayName.toLowerCase() === identifier.toLowerCase()
      );

    if (!target) return null;

    const session = this.getOrCreateSession(engine.getRoomId());

    // Release previous focus cleanly
    if (session.activeFocus) {
      this.releaseFocus(engine);
    }

    const focusTarget: FocusTarget = {
      participantId: target.id,
      displayName: target.displayName,
      focusedAt: Date.now(),
      focusedBy,
    };

    session.activeFocus = focusTarget;
    session.previousFocusIds.push(target.id);

    // Open focused person's mic
    engine.systemUnmute(target.id);
    engine.setMicActive(target.id, true);

    // Mute surrounding audience
    if (session.crowdMutedDuringFocus) {
      for (const p of participants) {
        if (p.id !== target.id && p.role === "AUDIENCE") {
          engine.systemMute(p.id);
        }
      }
    }

    return focusTarget;
  }

  /**
   * Release the current focus. Crowd mute is restored based on room state.
   */
  releaseFocus(engine: RoomVoiceEngine): void {
    const session = this.sessions.get(engine.getRoomId());
    if (!session?.activeFocus) return;

    const roomState = engine.getState();
    const prevId = session.activeFocus.participantId;

    session.activeFocus = null;

    // Restore audience voice based on room state
    for (const p of engine.getParticipants()) {
      if (p.role === "AUDIENCE") {
        if (roomState === "LIVE_SHOW") {
          // Keep audience muted after focus in live show — host must open crowd explicitly
          engine.systemMute(p.id);
        } else {
          engine.systemUnmute(p.id);
        }
      }
    }

    // Mute the previously focused person unless they're HOST/PERFORMER/CONTESTANT
    const prev = engine.getParticipant(prevId);
    if (prev && prev.role === "AUDIENCE") {
      if (roomState === "LIVE_SHOW") {
        engine.systemMute(prevId);
      }
    }
  }

  getActiveFocus(roomId: string): FocusTarget | null {
    return this.sessions.get(roomId)?.activeFocus ?? null;
  }

  isFocused(roomId: string, participantId: string): boolean {
    return this.sessions.get(roomId)?.activeFocus?.participantId === participantId;
  }

  getFocusHistory(roomId: string): string[] {
    return this.sessions.get(roomId)?.previousFocusIds ?? [];
  }

  setCrowdMutedDuringFocus(roomId: string, muted: boolean): void {
    const session = this.getOrCreateSession(roomId);
    session.crowdMutedDuringFocus = muted;
  }
}
