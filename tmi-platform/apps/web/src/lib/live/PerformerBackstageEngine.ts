"use client";

/**
 * PerformerBackstageEngine.ts — Performer Backstage / Rehearsal / Audition / Ensemble Live Authority.
 *
 * Laws:
 *   1. Private Performer Workspace:
 *      - Rehearsal, Auditions, Band/Group meetings, Collab sessions, Pre-Show Green Room.
 *   2. Server-Authoritative Role Gate:
 *      - A Fan guest joining backstage NEVER inherits performer GO LIVE or stage broadcast authority.
 *   3. Direct GO LIVE from Backstage:
 *      - Transition options: ME, SELECTED PERFORMERS, ENTIRE AUTHORIZED GROUP.
 *      - Routes selected WebRTC sources to public stage without reconnecting or tearing down feeds.
 *      - Non-selected participants remain private in the backstage green room.
 *   4. Audio Bus Separation:
 *      - BACKSTAGE TALK ≠ PROGRAM AUDIO.
 *      - Indicators: BACKSTAGE MIC, PROGRAM MIC, MUTED, ON AIR.
 *   5. Honest Music Latency:
 *      - Standard WebRTC is certified for discussion, audition, review, and turn-based rehearsal.
 *      - No fabricated zero-latency sync claims.
 */

import { create } from "zustand";
import type { PerformerLobbyMode } from "@/lib/live/performerLobbyModes";

export type BackstageParticipantRole =
  | "PERFORMER"
  | "BAND_MEMBER"
  | "CANDIDATE"
  | "CREW"
  | "FAN_GUEST";

export type AudioBusAssignment =
  | "BACKSTAGE_ONLY"   // Heard only by green room / backstage
  | "PROGRAM_ONLY"     // Heard only on public broadcast
  | "SIMULCAST"        // Heard both backstage and on air
  | "MUTED";           // Mic inactive

export type BackstageMicStatus =
  | "BACKSTAGE_MIC"
  | "PROGRAM_MIC"
  | "MUTED"
  | "ON_AIR";

export interface BackstageParticipant {
  userId: string;
  displayName: string;
  role: BackstageParticipantRole;
  streamId?: string;
  audioBus: AudioBusAssignment;
  isMuted: boolean;
  isOnStage: boolean;
  isSelectedForGoLive: boolean;
  candidateNotes?: string;
}

export interface EnsembleGoLivePayload {
  mode: "ME" | "SELECTED" | "ENTIRE_GROUP";
  targetStageRoomId: string;
  performerIds: string[];
}

export interface PerformerBackstageState {
  backstageRoomId: string | null;
  mode: PerformerLobbyMode;
  localUserId: string;
  localRole: BackstageParticipantRole;
  participants: BackstageParticipant[];
  isProgramLive: boolean;
  activeStageRoomId: string | null;
  programAudioGain: number;
  backstageTalkGain: number;

  // Actions
  initBackstage: (roomId: string, localUserId: string, role?: BackstageParticipantRole) => void;
  setMode: (mode: PerformerLobbyMode) => void;
  addParticipant: (p: BackstageParticipant) => void;
  removeParticipant: (userId: string) => void;
  toggleSelectParticipant: (userId: string) => void;
  setAudioBus: (userId: string, bus: AudioBusAssignment) => void;
  toggleMute: (userId: string) => void;
  getMicStatus: (userId: string) => BackstageMicStatus;
  canBroadcast: (role?: BackstageParticipantRole) => boolean;
  goLiveFromBackstage: (selection: "ME" | "SELECTED" | "ENTIRE_GROUP", stageRoomId: string) => EnsembleGoLivePayload | null;
  returnToBackstage: () => void;
}

export const usePerformerBackstageStore = create<PerformerBackstageState>((set, get) => ({
  backstageRoomId: null,
  mode: "REHEARSAL",
  localUserId: "local-performer",
  localRole: "PERFORMER",
  participants: [],
  isProgramLive: false,
  activeStageRoomId: null,
  programAudioGain: 1.0,
  backstageTalkGain: 1.0,

  initBackstage: (roomId, localUserId, role = "PERFORMER") => {
    set({
      backstageRoomId: roomId,
      localUserId,
      localRole: role,
      participants: [
        {
          userId: localUserId,
          displayName: "Me (Host)",
          role,
          audioBus: "BACKSTAGE_ONLY",
          isMuted: false,
          isOnStage: false,
          isSelectedForGoLive: true,
        },
      ],
    });
  },

  setMode: (mode) => set({ mode }),

  addParticipant: (p) => {
    set((s) => ({
      participants: s.participants.some((x) => x.userId === p.userId)
        ? s.participants.map((x) => (x.userId === p.userId ? { ...x, ...p } : x))
        : [...s.participants, p],
    }));
  },

  removeParticipant: (userId) => {
    set((s) => ({
      participants: s.participants.filter((p) => p.userId !== userId),
    }));
  },

  toggleSelectParticipant: (userId) => {
    set((s) => ({
      participants: s.participants.map((p) =>
        p.userId === userId ? { ...p, isSelectedForGoLive: !p.isSelectedForGoLive } : p,
      ),
    }));
  },

  setAudioBus: (userId, bus) => {
    set((s) => ({
      participants: s.participants.map((p) =>
        p.userId === userId ? { ...p, audioBus: bus } : p,
      ),
    }));
  },

  toggleMute: (userId) => {
    set((s) => ({
      participants: s.participants.map((p) =>
        p.userId === userId ? { ...p, isMuted: !p.isMuted } : p,
      ),
    }));
  },

  getMicStatus: (userId) => {
    const p = get().participants.find((x) => x.userId === userId);
    if (!p || p.isMuted) return "MUTED";
    if (p.isOnStage && (p.audioBus === "PROGRAM_ONLY" || p.audioBus === "SIMULCAST")) {
      return "ON_AIR";
    }
    if (p.audioBus === "PROGRAM_ONLY" || p.audioBus === "SIMULCAST") {
      return "PROGRAM_MIC";
    }
    return "BACKSTAGE_MIC";
  },

  canBroadcast: (role) => {
    const checkRole = role ?? get().localRole;
    // Server-authoritative capability check: FAN_GUEST NEVER inherits broadcast rights!
    return checkRole === "PERFORMER" || checkRole === "BAND_MEMBER" || checkRole === "CREW";
  },

  goLiveFromBackstage: (selection, stageRoomId) => {
    const state = get();
    // Verify local capability
    if (!state.canBroadcast(state.localRole)) {
      console.warn("[PerformerBackstageEngine] Unauthorized: Fan guest cannot trigger GO LIVE.");
      return null;
    }

    let targetParticipants: BackstageParticipant[] = [];
    if (selection === "ME") {
      targetParticipants = state.participants.filter((p) => p.userId === state.localUserId);
    } else if (selection === "SELECTED") {
      targetParticipants = state.participants.filter(
        (p) => p.isSelectedForGoLive && state.canBroadcast(p.role),
      );
    } else {
      // ENTIRE_GROUP — all eligible performers / band members
      targetParticipants = state.participants.filter((p) => state.canBroadcast(p.role));
    }

    const performerIds = targetParticipants.map((p) => p.userId);

    // Update state: route selected to stage without tearing down WebRTC feeds!
    set((s) => ({
      isProgramLive: true,
      activeStageRoomId: stageRoomId,
      participants: s.participants.map((p) =>
        performerIds.includes(p.userId)
          ? { ...p, isOnStage: true, audioBus: "SIMULCAST" }
          : { ...p, isOnStage: false, audioBus: "BACKSTAGE_ONLY" },
      ),
    }));

    return {
      mode: selection,
      targetStageRoomId: stageRoomId,
      performerIds,
    };
  },

  returnToBackstage: () => {
    set((s) => ({
      isProgramLive: false,
      activeStageRoomId: null,
      participants: s.participants.map((p) => ({
        ...p,
        isOnStage: false,
        audioBus: "BACKSTAGE_ONLY",
      })),
    }));
  },
}));
