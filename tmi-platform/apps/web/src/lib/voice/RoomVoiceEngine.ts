// RoomVoiceEngine.ts
// Core voice session state for a room. Runtime only — no WebRTC wiring.

import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";

export type VoiceRoomState = "FREE_ROAM" | "PRE_SHOW" | "LIVE_SHOW" | "POST_SHOW";

export type VoiceParticipantRole =
  | "HOST"
  | "CONTESTANT"
  | "PERFORMER"
  | "AUDIENCE"
  | "MODERATOR";

export interface VoiceParticipant {
  id: string;
  displayName: string;
  role: VoiceParticipantRole;
  micActive: boolean;
  muted: boolean;
  focused: boolean;
  joinedAt: number;
}

export interface VoiceRoomSnapshot {
  roomId: string;
  state: VoiceRoomState;
  voiceOpen: boolean;
  participants: VoiceParticipant[];
  activeSpeakerIds: string[];
  mutedBySystemIds: string[];
  updatedAt: number;
}

const OPEN_STATES: Record<VoiceRoomState, boolean> = {
  FREE_ROAM: true,
  PRE_SHOW: true,
  LIVE_SHOW: false, // gated — only host/contestant primary by default
  POST_SHOW: true,
};

export class RoomVoiceEngine {
  private roomId: string;
  private state: VoiceRoomState = "FREE_ROAM";
  private participants: Map<string, VoiceParticipant> = new Map();
  private activeSpeakerIds: Set<string> = new Set();
  private mutedBySystemIds: Set<string> = new Set();

  constructor(roomId: string, initialState?: VoiceRoomState) {
    this.roomId = roomId;
    if (initialState) this.state = initialState;
  }

  getRoomId(): string {
    return this.roomId;
  }

  getState(): VoiceRoomState {
    return this.state;
  }

  setState(state: VoiceRoomState): void {
    this.state = state;
    // When entering LIVE_SHOW, mute all audience participants at system level
    if (state === "LIVE_SHOW") {
      for (const p of this.participants.values()) {
        if (p.role === "AUDIENCE") {
          this.mutedBySystemIds.add(p.id);
        }
      }
    }
    // When leaving LIVE_SHOW, restore audience voice
    if (state === "POST_SHOW" || state === "FREE_ROAM") {
      for (const p of this.participants.values()) {
        if (p.role === "AUDIENCE") {
          this.mutedBySystemIds.delete(p.id);
        }
      }
    }
  }

  isVoiceOpen(): boolean {
    return OPEN_STATES[this.state];
  }

  addParticipant(participant: VoiceParticipant): void {
    // Auto-mute audience at system level during LIVE_SHOW
    if (this.state === "LIVE_SHOW" && participant.role === "AUDIENCE") {
      this.mutedBySystemIds.add(participant.id);
    }
    this.participants.set(participant.id, { ...participant });
  }

  removeParticipant(id: string): void {
    this.participants.delete(id);
    this.activeSpeakerIds.delete(id);
    this.mutedBySystemIds.delete(id);
  }

  getParticipant(id: string): VoiceParticipant | undefined {
    return this.participants.get(id);
  }

  getParticipants(): VoiceParticipant[] {
    return Array.from(this.participants.values());
  }

  getParticipantsByRole(role: VoiceParticipantRole): VoiceParticipant[] {
    return this.getParticipants().filter((p) => p.role === role);
  }

  setMicActive(id: string, active: boolean): void {
    const p = this.participants.get(id);
    if (!p) return;

    if (active) {
      const decision = enforceAdultTeenContactBlock({
        source: `voice-room:${this.roomId}`,
        channel: "voice",
        actor: {
          userId: p.id,
          ageClass: "unknown",
        },
        target: {
          userId: `voice-audience-${this.roomId}`,
          ageClass: "unknown",
        },
      });

      if (!decision.allowed) {
        this.activeSpeakerIds.delete(id);
        return;
      }
    }

    p.micActive = active;
    if (active && !this.mutedBySystemIds.has(id)) {
      this.activeSpeakerIds.add(id);
    } else {
      this.activeSpeakerIds.delete(id);
    }
  }

  systemMute(id: string): void {
    this.mutedBySystemIds.add(id);
    this.activeSpeakerIds.delete(id);
  }

  systemUnmute(id: string): void {
    this.mutedBySystemIds.delete(id);
    const p = this.participants.get(id);
    if (p?.micActive) this.activeSpeakerIds.add(id);
  }

  isSystemMuted(id: string): boolean {
    return this.mutedBySystemIds.has(id);
  }

  getActiveSpeakers(): VoiceParticipant[] {
    return Array.from(this.activeSpeakerIds)
      .map((id) => this.participants.get(id))
      .filter((p): p is VoiceParticipant => !!p);
  }

  getSnapshot(): VoiceRoomSnapshot {
    return {
      roomId: this.roomId,
      state: this.state,
      voiceOpen: this.isVoiceOpen(),
      participants: this.getParticipants(),
      activeSpeakerIds: Array.from(this.activeSpeakerIds),
      mutedBySystemIds: Array.from(this.mutedBySystemIds),
      updatedAt: Date.now(),
    };
  }
}
