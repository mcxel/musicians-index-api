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

export type MonitorPresentationMode = "SINGLE" | "DUAL";

export type VoltronCompositionFamily =
  | "FULL_FRAME"              // 1 full source
  | "TOP_BOTTOM"              // e.g. Performer top / Venue bottom or Performer top / Friend call bottom
  | "LEFT_RIGHT"              // e.g. Battle VS split or Performer left / Friend A right
  | "PRIMARY_PLUS_STRIP"      // e.g. Performer primary + friends strip (A, B, C)
  | "FOCUS_PLUS_FRIENDS"      // e.g. Focused participant + side strip
  | "GRID_4"                  // e.g. 4 performers Voltron grid (Backstage rehearsal or 4-way call)
  | "CORNER_PIP"              // e.g. Show full + friend call or reference media PiP
  | "DIAMOND_VOLTRON"         // e.g. Cypher / Battle center diamond composition
  | "CANDIDATE_PLUS_PANEL"    // e.g. Backstage Audition: candidate large + judges/band panel
  | "STAGE_AND_AUDIENCE";     // Stage top + Audience bottom

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
  id: string; // e.g. "panel-1-a", "panel-1-b", "panel-2-a"
  monitorId: "MONITOR_1" | "MONITOR_2";
  slotIndex: number;
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
}

const INITIAL_PANELS: AddressablePanel[] = [
  {
    id: "panel-1-a",
    monitorId: "MONITOR_1",
    slotIndex: 0,
    occupancy: "LIVE_EVENT_LOCKED",
    sourceType: "EXPERIENCE",
    sourceId: "canonical-experience-stream",
    label: "PERFORMER LIVE",
  },
  {
    id: "panel-1-b",
    monitorId: "MONITOR_1",
    slotIndex: 1,
    occupancy: "AVAILABLE",
    sourceType: "EMPTY",
    sourceId: null,
    label: "PANEL 1-B",
  },
  {
    id: "panel-1-c",
    monitorId: "MONITOR_1",
    slotIndex: 2,
    occupancy: "AVAILABLE",
    sourceType: "EMPTY",
    sourceId: null,
    label: "PANEL 1-C",
  },
  {
    id: "panel-1-d",
    monitorId: "MONITOR_1",
    slotIndex: 3,
    occupancy: "AVAILABLE",
    sourceType: "EMPTY",
    sourceId: null,
    label: "PANEL 1-D",
  },
  {
    id: "panel-2-a",
    monitorId: "MONITOR_2",
    slotIndex: 0,
    occupancy: "AVAILABLE",
    sourceType: "EMPTY",
    sourceId: null,
    label: "PANEL 2-A",
  },
  {
    id: "panel-2-b",
    monitorId: "MONITOR_2",
    slotIndex: 1,
    occupancy: "AVAILABLE",
    sourceType: "EMPTY",
    sourceId: null,
    label: "PANEL 2-B",
  },
];

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
          // Assign to MONITOR_2
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
    set({ composition: comp, isAutoLayout: false });
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
    const targetMonitor = state.monitorMode === "DUAL" ? "MONITOR_2" : "MONITOR_1";

    // Find first available panel on target monitor that is not protected (PINNED, LIVE_EVENT_LOCKED, SYSTEM_RESERVED)
    const eligibleIndex = state.panels.findIndex(
      (p) =>
        p.monitorId === targetMonitor &&
        p.occupancy === "AVAILABLE",
    );

    const fallbackIndex =
      eligibleIndex !== -1
        ? eligibleIndex
        : state.panels.findIndex(
            (p) =>
              p.monitorId === targetMonitor &&
              p.occupancy === "OCCUPIED_REPLACEABLE",
          );

    if (fallbackIndex === -1) {
      console.warn("[AdaptiveVoltron] No eligible panel found for call placement.");
      return null;
    }

    const allocatedPanelId = state.panels[fallbackIndex].id;

    set((s) => {
      const updatedPanels = s.panels.map((p, idx) =>
        idx === fallbackIndex
          ? {
              ...p,
              occupancy: "OCCUPIED_REPLACEABLE" as PanelOccupancy,
              sourceType: "CALL_PARTICIPANT" as PanelSourceType,
              sourceId: caller.id,
              label: caller.displayName,
            }
          : p,
      );

      const nextComp: VoltronCompositionFamily =
        s.monitorMode === "SINGLE" ? "LEFT_RIGHT" : s.composition;

      return {
        panels: updatedPanels,
        activeCallSessionId: callSessionId,
        friends: [caller],
        composition: s.isAutoLayout ? nextComp : s.composition,
      };
    });

    return get().panels[fallbackIndex];
  },

  addFriendParticipant: (friend) => {
    const state = get();
    if (state.friends.some((f) => f.id === friend.id)) return;

    const targetMonitor = state.monitorMode === "DUAL" ? "MONITOR_2" : "MONITOR_1";

    // Rule 35 Refinement: The call is ALREADY placed! Do NOT prompt for screen or player!
    // Sibling participant automatically binds into next eligible panel or overflow strip.
    const eligibleIndex = state.panels.findIndex(
      (p) => p.monitorId === targetMonitor && p.occupancy === "AVAILABLE",
    );

    set((s) => {
      const nextFriends = [...s.friends, friend];
      let updatedPanels = s.panels;

      if (eligibleIndex !== -1) {
        updatedPanels = s.panels.map((p, idx) =>
          idx === eligibleIndex
            ? {
                ...p,
                occupancy: "OCCUPIED_REPLACEABLE" as PanelOccupancy,
                sourceType: "CALL_PARTICIPANT" as PanelSourceType,
                sourceId: friend.id,
                label: friend.displayName,
              }
            : p,
        );
      }

      // Recompose layout based on total participants
      let nextComp = s.composition;
      if (s.isAutoLayout) {
        if (s.monitorMode === "SINGLE") {
          nextComp = nextFriends.length === 1 ? "LEFT_RIGHT" : "PRIMARY_PLUS_STRIP";
        } else {
          nextComp = nextFriends.length <= 2 ? "LEFT_RIGHT" : "GRID_4";
        }
      }

      return {
        friends: nextFriends,
        panels: updatedPanels,
        composition: nextComp,
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
              label: `PANEL ${p.slotIndex + 1}`,
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
          return { ...p, occupancy: "AVAILABLE" as PanelOccupancy, sourceId: null, sourceType: "EMPTY" as PanelSourceType };
        }
        // Assign to target monitor
        if (p.monitorId === targetMonitor && p.slotIndex < friendIds.length) {
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

      return { panels: updatedPanels };
    });
  },

  endCall: () => {
    set((s) => ({
      activeCallSessionId: null,
      friends: [],
      focusedParticipantId: null,
      focusedPanelId: null,
      pinnedParticipantIds: [],
      detachedParticipantIds: [],
      composition: "FULL_FRAME",
      panels: s.panels.map((p) =>
        p.sourceType === "CALL_PARTICIPANT"
          ? {
              ...p,
              occupancy: "AVAILABLE" as PanelOccupancy,
              sourceType: "EMPTY" as PanelSourceType,
              sourceId: null,
              label: `PANEL ${p.slotIndex + 1}`,
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
}));
