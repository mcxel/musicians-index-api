"use client";

/**
 * AdaptiveVoltronPresentationDirector.ts — Single-Monitor / Dual-Monitor Adaptive Voltron Presentation Law.
 *
 * FINAL ADDITION — NESTED ADDRESSABLE PANELS INSIDE ONE MONITOR:
 *
 * Laws:
 *   1. Core Distinction:
 *      - MONITOR ≠ PANEL
 *      - MEDIA PLAYER ≠ PARTICIPANT
 *      - CALL ≠ PARTICIPANT TILE
 *      - VOLTRON ≠ WEBRTC
 *      - LAYOUT CHANGE ≠ SESSION CHANGE
 *
 *   2. Canonical Hierarchy:
 *      WORKSPACE → MONITOR → VOLTRON / COMPOSITION → PANEL → MEDIA SOURCE.
 *      For Calls:
 *      WEBRTC CALL SESSION → REAL PARTICIPANT SOURCES → PARTICIPANT LAYOUT → ADDRESSABLE PANELS → VOLTRON COMPOSITION.
 *
 *   3. Single Canonical Monitor with Multiple Addressable Panels:
 *      A single monitor contains multiple independently addressable video/experience panels.
 *      A panel is not another monitor, and it isn't another session.
 *
 *   4. Experience + Incoming Call:
 *      - Watching Performer Live on Monitor 1 + Friend A calls → user accepts:
 *        Do NOT replace Performer Live. Allocate Panel B into 2-panel split (Performer | Friend A).
 *        Performer Live session and media player source are completely preserved; Friend A joins via WebRTC.
 *
 *   5. Sibling Participant Arrival (Rule 35 Refinement):
 *      - Friend B joins the SAME call: Voltron recomposes into 3 panels (Performer + Friend A + Friend B).
 *      - DO NOT ask "PICK MEDIA PLAYER" or "PICK SCREEN" for Friend B or Friend C.
 *        The call already has a presentation destination. New participants automatically receive their own panel.
 *
 *   6. Expand / Focus:
 *      - Clicking Friend B animates Friend B to FOCUS. Performer Live and other friends stay alive in secondary panels.
 *      - Returning restores prior composition without call reconnect or stream restart.
 *
 *   7. Dual-Monitor Spread & Recombine:
 *      - Enabling Monitor 2 spreads call to Monitor 2; Performer remains on Monitor 1. Same call.
 *      - Disabling Monitor 2 recombines all panels onto Monitor 1. No reconnect, no participant disappears.
 *
 *   8. Panel Occupancy Semantics:
 *      - AVAILABLE, OCCUPIED_REPLACEABLE, PINNED, LIVE_EVENT_LOCKED, SYSTEM_RESERVED, DEVICE_UNAVAILABLE.
 *      - Protected panels (PINNED, LIVE_EVENT_LOCKED, SYSTEM_RESERVED) are never silently overwritten.
 *
 *   9. Non-Disconnecting Overflow:
 *      - When source count exceeds usable panel capacity, use FOCUS + STRIP, participant banking, or carousel.
 *      - Off-screen participants remain connected; they are never disconnected by layout overflow.
 */

import { create } from "zustand";
import { resolveAutomaticVoltronComposition } from "@/lib/monitors/VoltronAutomaticCompositionPolicy";

export type MonitorPresentationMode = "SINGLE" | "DUAL";

export type VoltronCompositionFamily =
  | "FULL_FRAME"              // 1 full source
  | "TOP_BOTTOM"              // e.g. Performer top / Venue bottom or Performer top / Friend call bottom
  | "LEFT_RIGHT"              // e.g. Battle VS split or Performer left / Friend A right
  | "PRIMARY_PLUS_STRIP"      // e.g. Performer primary + friends strip (A, B, C)
  | "FOCUS_PLUS_FRIENDS"      // e.g. Focused participant + side strip
  | "GRID_4"                  // e.g. 4 performers Voltron grid (Backstage rehearsal or 4-way call)
  | "GRID_8"                  // e.g. 8 participant viewpoints on a single monitor (8+8 across dual monitors)
  | "CORNER_PIP"              // e.g. Show full + friend call or reference media PiP
  | "DIAMOND_VOLTRON"         // e.g. Cypher / Battle center diamond composition
  | "CANDIDATE_PLUS_PANEL"    // e.g. Backstage Audition: candidate large + judges/band panel
  | "STAGE_AND_AUDIENCE"      // Stage top + Audience bottom
  | "CINEMA_THEATER"          // Watch Together transformation: performance hero + friend filmstrip
  | "AUDIENCE_SEATED";        // Concert Audience Mode: friends seated in venue + subtle voice/camera presence

export type SocialCinemaMode =
  | "HANGOUT"
  | "CONCERT"
  | "AVATAR_LOBBY"
  | "STUDIO";

export type DualPresenceChoice =
  | "AVATAR_PLUS_CAMERA"
  | "AVATAR_ONLY"
  | "CAMERA_ONLY"
  | "AUDIO_ONLY";

export type AudienceCameraViewpoint = "FIRST_PERSON" | "THIRD_PERSON";

export type VoltronMotionPreference = "AUTO" | "MANUAL" | "REDUCED";

export type SocialTransitionEffect =
  | "NONE"
  | "MAGNETIC_ARRIVAL"
  | "CINEMA_MORPH"
  | "SPOTLIGHT_PULSE"
  | "PORTAL_TRANSITION"
  | "DIRECTOR_SHUFFLE";

export interface GroupExperienceInvite {
  inviteId: string;
  callSessionId: string;
  fromUserId: string;
  fromDisplayName: string;
  targetExperience: "SHOW" | "CONCERT" | "LOUNGE" | "FAN_AVATAR_LOBBY";
  targetRoomId: string;
  targetLabel: string;
  sitTogetherRequested?: boolean;
  createdAtMs: number;
  status: "PENDING" | "ACCEPTED" | "STAYED_BEHIND" | "EXPIRED";
}

export interface SitTogetherAssignment {
  groupId: string;
  roomId: string;
  sectionLabel: string;
  seatIdsByParticipant: Record<string, string>;
  viewpointByParticipant: Record<string, AudienceCameraViewpoint>;
}

export interface SocialReactionBurst {
  id: string;
  senderId: string;
  senderName: string;
  emoji: string;
  label: string;
  createdAtMs: number;
}

export const MAX_VIEWPOINTS_PER_MONITOR = 8 as const;
export const MAX_TOTAL_SOCIAL_CALL_PARTICIPANTS = 16 as const;

export type PanelOccupancy =
  | "AVAILABLE"
  | "OCCUPIED_REPLACEABLE"
  | "PINNED"
  | "LIVE_EVENT_LOCKED"
  | "SYSTEM_RESERVED"
  | "DEVICE_UNAVAILABLE";

export type PanelSourceType =
  | "EXPERIENCE"
  | "CALL_PARTICIPANT"
  | "AVATAR_LOBBY"
  | "MEDIA"
  | "EMPTY";

export interface AddressablePanel {
  id: string; // e.g. "panel-1-a" .. "panel-1-h", "panel-2-a" .. "panel-2-h"
  monitorId: "MONITOR_1" | "MONITOR_2";
  slotIndex: number; // 0..7 within the monitor
  /** Canonical 1..16 global participant viewpoint position (1..8 on Monitor 1, 9..16 on Monitor 2). */
  globalPosition?: number;
  occupancy: PanelOccupancy;
  sourceType: PanelSourceType;
  sourceId: string | null;
  label: string;
  isFocused?: boolean;
  isPinned?: boolean;
}

export interface FriendCallParticipant {
  id: string;
  displayName: string;
  streamId?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  avatarUrl?: string | null;
  /** Real audio activity from Daily/WebRTC (Claude contract) — drives Spotlight Pulse & lip-sync. */
  isSpeaking?: boolean;
  /** 0..1 normalized RMS audio level from Daily/WebRTC (Claude contract). */
  audioLevel?: number;
  /** Dual-Presence personal choice (AVATAR_PLUS_CAMERA | AVATAR_ONLY | CAMERA_ONLY | AUDIO_ONLY). */
  presenceChoice?: DualPresenceChoice;
  /** Assigned seat anchor id when in Audience Mode / Sit Together. */
  seatId?: string | null;
  /** Assigned 1..16 global position across Monitor 1 (1..8) and Monitor 2 (9..16). */
  globalPosition?: number;
}

export interface AdaptiveVoltronState {
  monitorMode: MonitorPresentationMode;
  composition: VoltronCompositionFamily;
  isAutoLayout: boolean;
  panels: AddressablePanel[];
  activeCallSessionId: string | null;
  friends: FriendCallParticipant[];
  focusedParticipantId: string | null;
  focusedPanelId: string | null;
  pinnedParticipantIds: string[];
  detachedParticipantIds: string[];
  isDedicatedView: boolean;
  dedicatedTarget: "SHOW" | "CALL" | "VENUE" | "MEDIA" | null;

  // Social Cinema — Living Video Chat & Dual Presence state
  socialCinemaMode: SocialCinemaMode;
  motionPreference: VoltronMotionPreference;
  allowAmbientPanelMovement: boolean;
  activeTransitionEffect: SocialTransitionEffect;
  activeSpeakerId: string | null;
  selfPresenceChoice: DualPresenceChoice;
  audienceModeActive: boolean;
  audienceCameraViewpoint: AudienceCameraViewpoint;
  floatingHeadPanelsVisibleInShow: boolean;
  showCallAudioDucking: boolean;
  sfuGroupTransportReady: boolean;
  pendingExperienceInvite: GroupExperienceInvite | null;
  sitTogetherAssignment: SitTogetherAssignment | null;
  recentReactions: SocialReactionBurst[];
  reactionsVisible: boolean;

  // Actions
  setMonitorMode: (mode: MonitorPresentationMode) => void;
  toggleMonitorMode: () => void;
  setComposition: (comp: VoltronCompositionFamily) => void;
  setAutoLayout: (auto: boolean) => void;
  allocateCall: (callSessionId: string, caller: FriendCallParticipant) => AddressablePanel | null;
  addFriendParticipant: (friend: FriendCallParticipant) => void;
  removeFriendParticipant: (id: string) => void;
  focusParticipant: (id: string | null) => void;
  focusPanel: (panelId: string | null) => void;
  returnFromFocus: () => void;
  pinParticipant: (id: string) => void;
  unpinParticipant: (id: string) => void;
  detachParticipant: (id: string) => void;
  returnParticipant: (id: string) => void;
  moveCallToMonitor: (targetMonitor: "MONITOR_1" | "MONITOR_2") => void;
  endCall: () => void;
  setDedicatedView: (target: "SHOW" | "CALL" | "VENUE" | "MEDIA" | null) => void;
  bindExperienceSource: (sourceId: string, label: string) => void;

  // Social Cinema & Dual Presence Actions
  setSocialCinemaMode: (mode: SocialCinemaMode) => void;
  setMotionPreference: (pref: VoltronMotionPreference) => void;
  setAllowAmbientPanelMovement: (allow: boolean) => void;
  triggerTransitionEffect: (effect: SocialTransitionEffect) => void;
  updateParticipantSpeaking: (participantId: string, isSpeaking: boolean, audioLevel?: number) => void;
  setSelfPresenceChoice: (choice: DualPresenceChoice) => void;
  setAudienceModeActive: (active: boolean) => void;
  setAudienceCameraViewpoint: (viewpoint: AudienceCameraViewpoint) => void;
  setFloatingHeadPanelsVisibleInShow: (visible: boolean) => void;
  setShowCallAudioDucking: (enabled: boolean) => void;
  setSfuGroupTransportReady: (ready: boolean) => void;
  proposeGroupExperienceInvite: (invite: Omit<GroupExperienceInvite, "inviteId" | "createdAtMs" | "status">) => GroupExperienceInvite;
  respondGroupExperienceInvite: (decision: "ACCEPTED" | "STAYED_BEHIND") => void;
  requestSitTogether: (roomId: string, sectionLabel?: string) => SitTogetherAssignment;
  sendSocialReaction: (emoji: string, label: string, senderId?: string, senderName?: string) => SocialReactionBurst;
  setReactionsVisible: (visible: boolean) => void;
  shuffleDirectorViewpoints: () => void;
}

const LETTERS_8 = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export function buildCanonical16Panels(): AddressablePanel[] {
  const m1: AddressablePanel[] = LETTERS_8.map((letter, idx) => ({
    id: `panel-1-${letter}`,
    monitorId: "MONITOR_1",
    slotIndex: idx,
    globalPosition: idx + 1,
    occupancy: idx === 0 ? "LIVE_EVENT_LOCKED" : "AVAILABLE",
    sourceType: idx === 0 ? "EXPERIENCE" : "EMPTY",
    sourceId: idx === 0 ? "canonical-experience-stream" : null,
    label: idx === 0 ? "PERFORMER LIVE" : `PANEL 1-${letter.toUpperCase()}`,
  }));
  const m2: AddressablePanel[] = LETTERS_8.map((letter, idx) => ({
    id: `panel-2-${letter}`,
    monitorId: "MONITOR_2",
    slotIndex: idx,
    globalPosition: idx + 9,
    occupancy: "AVAILABLE",
    sourceType: "EMPTY",
    sourceId: null,
    label: `PANEL 2-${letter.toUpperCase()}`,
  }));
  return [...m1, ...m2];
}

const INITIAL_PANELS: AddressablePanel[] = buildCanonical16Panels();

export const useAdaptiveVoltronStore = create<AdaptiveVoltronState>((set, get) => ({
  monitorMode: "DUAL",
  composition: "PRIMARY_PLUS_STRIP",
  isAutoLayout: true,
  panels: INITIAL_PANELS,
  activeCallSessionId: null,
  friends: [],
  focusedParticipantId: null,
  focusedPanelId: null,
  pinnedParticipantIds: [],
  detachedParticipantIds: [],
  isDedicatedView: false,
  dedicatedTarget: null,

  // Social Cinema — Living Video Chat & Dual Presence defaults
  socialCinemaMode: "HANGOUT",
  motionPreference: "AUTO",
  allowAmbientPanelMovement: true,
  activeTransitionEffect: "NONE",
  activeSpeakerId: null,
  selfPresenceChoice: "AVATAR_PLUS_CAMERA",
  audienceModeActive: false,
  audienceCameraViewpoint: "THIRD_PERSON",
  floatingHeadPanelsVisibleInShow: true,
  showCallAudioDucking: true,
  sfuGroupTransportReady: false,
  pendingExperienceInvite: null,
  sitTogetherAssignment: null,
  recentReactions: [],
  reactionsVisible: true,

  setMonitorMode: (mode) => {
    const prevMode = get().monitorMode;
    if (prevMode === mode) return;

    set({ monitorMode: mode });

    // Transition panel layout smoothly without reconnecting sessions:
    if (mode === "SINGLE") {
      // Recombine all active panels (experience + call participants) onto MONITOR_1
      set((s) => {
        const callPanels = s.panels.filter(
          (p) => p.sourceType === "CALL_PARTICIPANT" || p.sourceType === "MEDIA",
        );
        const newPanels = s.panels.map((p) => {
          if (p.monitorId === "MONITOR_1") return p;
          return { ...p, occupancy: "AVAILABLE" as PanelOccupancy, sourceId: null, sourceType: "EMPTY" as PanelSourceType };
        });

        // Assign call participants into available MONITOR_1 panels
        let callIdx = 0;
        for (let i = 0; i < newPanels.length; i++) {
          if (newPanels[i].monitorId === "MONITOR_1" && newPanels[i].occupancy === "AVAILABLE" && callIdx < callPanels.length) {
            newPanels[i] = {
              ...newPanels[i],
              occupancy: "OCCUPIED_REPLACEABLE",
              sourceType: callPanels[callIdx].sourceType,
              sourceId: callPanels[callIdx].sourceId,
              label: callPanels[callIdx].label,
            };
            callIdx++;
          }
        }

        const count = s.friends.length;
        const nextComp: VoltronCompositionFamily =
          count === 0 ? "FULL_FRAME" : count === 1 ? "LEFT_RIGHT" : "PRIMARY_PLUS_STRIP";

        return { panels: newPanels, composition: s.isAutoLayout ? nextComp : s.composition };
      });
    } else {
      // DUAL mode: Spread call presentation to MONITOR_2; Experience stays on MONITOR_1
      set((s) => {
        const friendIds = s.friends.map((f) => f.id);
        const newPanels = s.panels.map((p) => {
          // Clear call participants off MONITOR_1
          if (p.monitorId === "MONITOR_1" && p.sourceType === "CALL_PARTICIPANT") {
            return { ...p, occupancy: "AVAILABLE" as PanelOccupancy, sourceId: null, sourceType: "EMPTY" as PanelSourceType };
          }
          // Assign to MONITOR_2 (up to 8 slots; overflow stays on MONITOR_1)
          if (p.monitorId === "MONITOR_2" && p.slotIndex < friendIds.length) {
            const friend = s.friends[p.slotIndex];
            return {
              ...p,
              occupancy: "OCCUPIED_REPLACEABLE" as PanelOccupancy,
              sourceType: "CALL_PARTICIPANT" as PanelSourceType,
              sourceId: friend.id,
              label: friend.displayName,
            };
          }
          return p;
        });
        return { panels: newPanels };
      });
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:voltron:monitor-mode", { detail: { mode } }),
      );
    }
  },

  toggleMonitorMode: () => {
    const next = get().monitorMode === "DUAL" ? "SINGLE" : "DUAL";
    get().setMonitorMode(next);
  },

  setComposition: (comp) => {
    const isCinemaMorph = comp === "CINEMA_THEATER" || comp === "AUDIENCE_SEATED" || comp === "PRIMARY_PLUS_STRIP";
    set((s) => ({
      composition: comp,
      isAutoLayout: false,
      activeTransitionEffect: s.motionPreference === "REDUCED"
        ? "NONE"
        : isCinemaMorph
          ? "CINEMA_MORPH"
          : "DIRECTOR_SHUFFLE",
    }));
  },

  setAutoLayout: (auto) => {
    set({ isAutoLayout: auto });
  },

  bindExperienceSource: (sourceId, label) => {
    set((s) => ({
      panels: s.panels.map((p) =>
        p.id === "panel-1-a"
          ? { ...p, sourceId, label, occupancy: "LIVE_EVENT_LOCKED", sourceType: "EXPERIENCE" }
          : p,
      ),
    }));
  },

  allocateCall: (callSessionId, caller) => {
    const state = get();
    // Owner law: Monitor 1 first, then Monitor 2. Never auto-overwrite occupied panels.
    // SINGLE mode still searches MONITOR_1 slots only (mobile one-monitor default).
    const searchOrder: Array<"MONITOR_1" | "MONITOR_2"> =
      state.monitorMode === "SINGLE" ? ["MONITOR_1"] : ["MONITOR_1", "MONITOR_2"];

    let fallbackIndex = -1;
    for (const monitorId of searchOrder) {
      fallbackIndex = state.panels.findIndex(
        (p) => p.monitorId === monitorId && p.occupancy === "AVAILABLE",
      );
      if (fallbackIndex !== -1) break;
    }

    if (fallbackIndex === -1) {
      console.warn(
        "[AdaptiveVoltron] No AVAILABLE panel for call (M1→M2). Will not replace occupied content.",
      );
      return null;
    }

    set((s) => {
      const targetPanel = s.panels[fallbackIndex];
      const enrichedCaller: FriendCallParticipant = {
        ...caller,
        presenceChoice: caller.presenceChoice ?? "AVATAR_PLUS_CAMERA",
        globalPosition: targetPanel?.globalPosition ?? (fallbackIndex + 1),
      };
      const updatedPanels = s.panels.map((p, idx) =>
        idx === fallbackIndex
          ? {
              ...p,
              occupancy: "OCCUPIED_REPLACEABLE" as PanelOccupancy,
              sourceType: "CALL_PARTICIPANT" as PanelSourceType,
              sourceId: enrichedCaller.id,
              label: enrichedCaller.displayName,
            }
          : p,
      );

      const autoPlan = resolveAutomaticVoltronComposition({
        event: "FRIEND_CALL_ACCEPTED",
        acceptedFriendCount: 1,
      });
      const nextComp: VoltronCompositionFamily = autoPlan.voltronFamily;

      return {
        panels: updatedPanels,
        activeCallSessionId: callSessionId,
        friends: [enrichedCaller],
        composition: s.isAutoLayout ? nextComp : s.composition,
        activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : "MAGNETIC_ARRIVAL",
      };
    });

    return get().panels[fallbackIndex];
  },

  addFriendParticipant: (friend) => {
    const state = get();
    if (state.friends.some((f) => f.id === friend.id)) return;
    if (state.friends.length >= MAX_TOTAL_SOCIAL_CALL_PARTICIPANTS) {
      console.warn("[AdaptiveVoltron] 16-participant social call capacity reached (8+8).");
      return;
    }

    // Next friend → next free slot: Monitor 1 then Monitor 2 (SFU group media still gated separately).
    const searchOrder: Array<"MONITOR_1" | "MONITOR_2"> =
      state.monitorMode === "SINGLE" ? ["MONITOR_1"] : ["MONITOR_1", "MONITOR_2"];

    let eligibleIndex = -1;
    for (const monitorId of searchOrder) {
      eligibleIndex = state.panels.findIndex(
        (p) => p.monitorId === monitorId && p.occupancy === "AVAILABLE",
      );
      if (eligibleIndex !== -1) break;
    }

    set((s) => {
      const targetPanel = eligibleIndex !== -1 ? s.panels[eligibleIndex] : undefined;
      const enrichedFriend: FriendCallParticipant = {
        ...friend,
        presenceChoice: friend.presenceChoice ?? "AVATAR_PLUS_CAMERA",
        globalPosition: targetPanel?.globalPosition ?? (s.friends.length + 2),
      };
      const nextFriends = [...s.friends, enrichedFriend];
      let updatedPanels = s.panels;

      if (eligibleIndex !== -1) {
        updatedPanels = s.panels.map((p, idx) =>
          idx === eligibleIndex
            ? {
                ...p,
                occupancy: "OCCUPIED_REPLACEABLE" as PanelOccupancy,
                sourceType: "CALL_PARTICIPANT" as PanelSourceType,
                sourceId: enrichedFriend.id,
                label: enrichedFriend.displayName,
              }
            : p,
        );
      }

      // Recompose layout based on total participants (1 -> 2 -> 4 -> 8 -> 16)
      let nextComp = s.composition;
      if (s.isAutoLayout) {
        if (s.audienceModeActive) {
          nextComp = "AUDIENCE_SEATED";
        } else if (s.socialCinemaMode === "CONCERT") {
          nextComp = "CINEMA_THEATER";
        } else if (s.monitorMode === "SINGLE") {
          nextComp = nextFriends.length === 1 ? "LEFT_RIGHT" : "PRIMARY_PLUS_STRIP";
        } else if (nextFriends.length <= 2) {
          nextComp = "LEFT_RIGHT";
        } else if (nextFriends.length <= 4) {
          nextComp = "GRID_4";
        } else {
          nextComp = "GRID_8";
        }
      }

      return {
        friends: nextFriends,
        panels: updatedPanels,
        composition: nextComp,
        activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : "MAGNETIC_ARRIVAL",
      };
    });
  },

  removeFriendParticipant: (id) => {
    set((s) => {
      const remaining = s.friends.filter((f) => f.id !== id);
      const updatedPanels = s.panels.map((p) =>
        p.sourceId === id
          ? {
              ...p,
              occupancy: "AVAILABLE" as PanelOccupancy,
              sourceType: "EMPTY" as PanelSourceType,
              sourceId: null,
              label: `PANEL ${p.monitorId === "MONITOR_1" ? "1" : "2"}-${LETTERS_8[p.slotIndex]?.toUpperCase() ?? (p.slotIndex + 1)}`,
              isFocused: false,
            }
          : p,
      );

      let nextComp = s.composition;
      if (s.isAutoLayout) {
        if (remaining.length === 0) {
          nextComp = "FULL_FRAME";
        } else if (remaining.length === 1) {
          nextComp = "LEFT_RIGHT";
        } else {
          nextComp = "PRIMARY_PLUS_STRIP";
        }
      }

      return {
        friends: remaining,
        panels: updatedPanels,
        focusedParticipantId: s.focusedParticipantId === id ? null : s.focusedParticipantId,
        focusedPanelId: s.focusedPanelId === id ? null : s.focusedPanelId,
        activeSpeakerId: s.activeSpeakerId === id ? null : s.activeSpeakerId,
        composition: nextComp,
        activeCallSessionId: remaining.length === 0 ? null : s.activeCallSessionId,
      };
    });
  },

  focusParticipant: (id) => {
    set((s) => {
      const targetPanel = s.panels.find((p) => p.sourceId === id);
      return {
        focusedParticipantId: id,
        focusedPanelId: targetPanel ? targetPanel.id : null,
        composition: id ? "FOCUS_PLUS_FRIENDS" : (s.friends.length > 1 ? "PRIMARY_PLUS_STRIP" : "LEFT_RIGHT"),
        activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : "SPOTLIGHT_PULSE",
        panels: s.panels.map((p) => ({
          ...p,
          isFocused: p.sourceId === id,
        })),
      };
    });
  },

  focusPanel: (panelId) => {
    set((s) => {
      const targetPanel = s.panels.find((p) => p.id === panelId);
      return {
        focusedPanelId: panelId,
        focusedParticipantId: targetPanel?.sourceId ?? null,
        composition: panelId ? "FOCUS_PLUS_FRIENDS" : (s.friends.length > 1 ? "PRIMARY_PLUS_STRIP" : "LEFT_RIGHT"),
        activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : "SPOTLIGHT_PULSE",
        panels: s.panels.map((p) => ({
          ...p,
          isFocused: p.id === panelId,
        })),
      };
    });
  },

  returnFromFocus: () => {
    get().focusParticipant(null);
  },

  pinParticipant: (id) => {
    set((s) => ({
      pinnedParticipantIds: s.pinnedParticipantIds.includes(id)
        ? s.pinnedParticipantIds
        : [...s.pinnedParticipantIds, id],
      panels: s.panels.map((p) =>
        p.sourceId === id ? { ...p, occupancy: "PINNED", isPinned: true } : p,
      ),
    }));
  },

  unpinParticipant: (id) => {
    set((s) => ({
      pinnedParticipantIds: s.pinnedParticipantIds.filter((p) => p !== id),
      panels: s.panels.map((p) =>
        p.sourceId === id ? { ...p, occupancy: "OCCUPIED_REPLACEABLE", isPinned: false } : p,
      ),
    }));
  },

  detachParticipant: (id) => {
    // Presentation only: does NOT create duplicate participant presence or new WebRTC session!
    set((s) => ({
      detachedParticipantIds: s.detachedParticipantIds.includes(id)
        ? s.detachedParticipantIds
        : [...s.detachedParticipantIds, id],
    }));
  },

  returnParticipant: (id) => {
    set((s) => ({
      detachedParticipantIds: s.detachedParticipantIds.filter((p) => p !== id),
    }));
  },

  moveCallToMonitor: (targetMonitor) => {
    set((s) => {
      const friendIds = s.friends.map((f) => f.id);
      const otherMonitor = targetMonitor === "MONITOR_1" ? "MONITOR_2" : "MONITOR_1";

      const updatedPanels = s.panels.map((p) => {
        // Clear from other monitor
        if (p.monitorId === otherMonitor && p.sourceType === "CALL_PARTICIPANT") {
          return {
            ...p,
            occupancy: "AVAILABLE" as PanelOccupancy,
            sourceId: null,
            sourceType: "EMPTY" as PanelSourceType,
            label: `PANEL ${p.monitorId === "MONITOR_1" ? "1" : "2"}-${LETTERS_8[p.slotIndex]?.toUpperCase() ?? (p.slotIndex + 1)}`,
          };
        }
        // Assign to target monitor (respecting locked slot 0 on MONITOR_1 if occupied by LIVE_EVENT_LOCKED)
        if (p.monitorId === targetMonitor) {
          const offset = targetMonitor === "MONITOR_1" && s.panels[0]?.occupancy === "LIVE_EVENT_LOCKED" ? 1 : 0;
          const friendIdx = p.slotIndex - offset;
          if (friendIdx >= 0 && friendIdx < friendIds.length) {
            const friend = s.friends[friendIdx];
            return {
              ...p,
              occupancy: "OCCUPIED_REPLACEABLE" as PanelOccupancy,
              sourceType: "CALL_PARTICIPANT" as PanelSourceType,
              sourceId: friend.id,
              label: friend.displayName,
            };
          }
        }
        return p;
      });

      return {
        panels: updatedPanels,
        activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : "DIRECTOR_SHUFFLE",
      };
    });
  },

  endCall: () => {
    set((s) => ({
      activeCallSessionId: null,
      friends: [],
      focusedParticipantId: null,
      focusedPanelId: null,
      activeSpeakerId: null,
      pinnedParticipantIds: [],
      detachedParticipantIds: [],
      pendingExperienceInvite: null,
      sitTogetherAssignment: null,
      audienceModeActive: false,
      composition: "FULL_FRAME",
      panels: s.panels.map((p) =>
        p.sourceType === "CALL_PARTICIPANT"
          ? {
              ...p,
              occupancy: "AVAILABLE" as PanelOccupancy,
              sourceType: "EMPTY" as PanelSourceType,
              sourceId: null,
              label: `PANEL ${p.monitorId === "MONITOR_1" ? "1" : "2"}-${LETTERS_8[p.slotIndex]?.toUpperCase() ?? (p.slotIndex + 1)}`,
              isFocused: false,
              isPinned: false,
            }
          : p,
      ),
    }));
  },

  setDedicatedView: (target) => {
    set({
      isDedicatedView: target !== null,
      dedicatedTarget: target,
    });
  },

  setSocialCinemaMode: (mode) => {
    set((s) => {
      let nextComp = s.composition;
      let nextAudienceMode = s.audienceModeActive;
      let effect: SocialTransitionEffect = "DIRECTOR_SHUFFLE";

      if (mode === "CONCERT") {
        nextComp = "CINEMA_THEATER";
        effect = "CINEMA_MORPH";
      } else if (mode === "AVATAR_LOBBY") {
        nextComp = "PRIMARY_PLUS_STRIP";
        effect = "PORTAL_TRANSITION";
      } else if (mode === "STUDIO") {
        nextComp = "LEFT_RIGHT";
        effect = "DIRECTOR_SHUFFLE";
      } else {
        nextComp = s.friends.length > 2 ? "GRID_4" : "LEFT_RIGHT";
        nextAudienceMode = false;
        effect = "MAGNETIC_ARRIVAL";
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:social-cinema:mode-change", {
            detail: { mode, composition: nextComp, effect },
          }),
        );
      }

      return {
        socialCinemaMode: mode,
        composition: nextComp,
        audienceModeActive: nextAudienceMode,
        activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : effect,
      };
    });
  },

  setMotionPreference: (pref) => {
    set({
      motionPreference: pref,
      allowAmbientPanelMovement: pref === "AUTO",
      activeTransitionEffect: pref === "REDUCED" ? "NONE" : get().activeTransitionEffect,
    });
  },

  setAllowAmbientPanelMovement: (allow) => {
    set({
      allowAmbientPanelMovement: allow,
      motionPreference: allow ? "AUTO" : "MANUAL",
    });
  },

  triggerTransitionEffect: (effect) => {
    set((s) => ({
      activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : effect,
    }));
  },

  updateParticipantSpeaking: (participantId, isSpeaking, audioLevel = 0) => {
    set((s) => {
      const clampedLevel = Math.max(0, Math.min(1, audioLevel));
      const updatedFriends = s.friends.map((f) =>
        f.id === participantId
          ? { ...f, isSpeaking, audioLevel: clampedLevel }
          : f,
      );
      const nextSpeaker = isSpeaking
        ? participantId
        : s.activeSpeakerId === participantId
          ? (updatedFriends.find((f) => f.isSpeaking)?.id ?? null)
          : s.activeSpeakerId;
      return {
        friends: updatedFriends,
        activeSpeakerId: nextSpeaker,
        activeTransitionEffect:
          isSpeaking && s.motionPreference !== "REDUCED"
            ? "SPOTLIGHT_PULSE"
            : s.activeTransitionEffect,
      };
    });
  },

  setSelfPresenceChoice: (choice) => {
    set({ selfPresenceChoice: choice });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:social-cinema:presence-choice", {
          detail: { choice },
        }),
      );
    }
  },

  setAudienceModeActive: (active) => {
    set((s) => ({
      audienceModeActive: active,
      composition: active ? "AUDIENCE_SEATED" : s.socialCinemaMode === "CONCERT" ? "CINEMA_THEATER" : "LEFT_RIGHT",
      floatingHeadPanelsVisibleInShow: active ? false : s.floatingHeadPanelsVisibleInShow,
      activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : "CINEMA_MORPH",
    }));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:social-cinema:audience-mode", {
          detail: { active },
        }),
      );
    }
  },

  setAudienceCameraViewpoint: (viewpoint) => {
    set({ audienceCameraViewpoint: viewpoint });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:social-cinema:camera-viewpoint", {
          detail: { viewpoint },
        }),
      );
    }
  },

  setFloatingHeadPanelsVisibleInShow: (visible) => {
    set({ floatingHeadPanelsVisibleInShow: visible });
  },

  setShowCallAudioDucking: (enabled) => {
    set({ showCallAudioDucking: enabled });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:social-cinema:audio-ducking", {
          detail: { enabled },
        }),
      );
    }
  },

  setSfuGroupTransportReady: (ready) => {
    set({ sfuGroupTransportReady: ready });
  },

  proposeGroupExperienceInvite: (inviteInput) => {
    const invite: GroupExperienceInvite = {
      ...inviteInput,
      inviteId: `invite-${Date.now()}`,
      createdAtMs: Date.now(),
      status: "PENDING",
    };
    set((s) => ({
      pendingExperienceInvite: invite,
      activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : "PORTAL_TRANSITION",
    }));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:social-cinema:group-invite", { detail: invite }),
      );
    }
    return invite;
  },

  respondGroupExperienceInvite: (decision) => {
    const current = get().pendingExperienceInvite;
    if (!current) return;
    const updated: GroupExperienceInvite = { ...current, status: decision };
    set((s) => ({
      pendingExperienceInvite: updated,
      socialCinemaMode:
        decision === "ACCEPTED"
          ? current.targetExperience === "FAN_AVATAR_LOBBY"
            ? "AVATAR_LOBBY"
            : current.targetExperience === "CONCERT" || current.targetExperience === "SHOW"
              ? "CONCERT"
              : "HANGOUT"
          : s.socialCinemaMode,
      audienceModeActive:
        decision === "ACCEPTED" && (current.targetExperience === "CONCERT" || current.targetExperience === "SHOW")
          ? Boolean(current.sitTogetherRequested)
          : s.audienceModeActive,
      activeTransitionEffect:
        decision === "ACCEPTED" && s.motionPreference !== "REDUCED"
          ? "PORTAL_TRANSITION"
          : s.activeTransitionEffect,
    }));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:social-cinema:group-invite-response", {
          detail: updated,
        }),
      );
    }
  },

  requestSitTogether: (roomId, sectionLabel = "Row B · Center House") => {
    const state = get();
    const participantIds = ["self", ...state.friends.map((f) => f.id)];
    const seatIdsByParticipant: Record<string, string> = {};
    const viewpointByParticipant: Record<string, AudienceCameraViewpoint> = {};
    participantIds.forEach((pid, idx) => {
      seatIdsByParticipant[pid] = `seat-rowB-${idx + 1}`;
      viewpointByParticipant[pid] = idx === 0 ? state.audienceCameraViewpoint : "THIRD_PERSON";
    });
    const assignment: SitTogetherAssignment = {
      groupId: state.activeCallSessionId ?? `group-${roomId}`,
      roomId,
      sectionLabel,
      seatIdsByParticipant,
      viewpointByParticipant,
    };
    set((s) => ({
      sitTogetherAssignment: assignment,
      audienceModeActive: true,
      composition: "AUDIENCE_SEATED",
      friends: s.friends.map((f) => ({
        ...f,
        seatId: seatIdsByParticipant[f.id] ?? f.seatId ?? null,
      })),
      activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : "CINEMA_MORPH",
    }));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:social-cinema:sit-together", {
          detail: assignment,
        }),
      );
    }
    return assignment;
  },

  sendSocialReaction: (emoji, label, senderId = "self", senderName = "You") => {
    const burst: SocialReactionBurst = {
      id: `rx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId,
      senderName,
      emoji,
      label,
      createdAtMs: Date.now(),
    };
    set((s) => ({
      recentReactions: [...s.recentReactions.slice(-11), burst],
    }));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:social-cinema:reaction", { detail: burst }),
      );
    }
    return burst;
  },

  setReactionsVisible: (visible) => {
    set({ reactionsVisible: visible });
  },

  shuffleDirectorViewpoints: () => {
    set((s) => {
      if (s.friends.length <= 1) {
        return {
          activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : "DIRECTOR_SHUFFLE",
        };
      }
      const rotated = [...s.friends.slice(1), s.friends[0]!];
      return {
        friends: rotated,
        activeTransitionEffect: s.motionPreference === "REDUCED" ? "NONE" : "DIRECTOR_SHUFFLE",
      };
    });
  },
}));
