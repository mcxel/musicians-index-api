"use client";

/**
 * FanAvatarLobbyStore — Fan Avatar Lobby Session, Public Presence & Experience Warp Authority.
 *
 * Laws:
 *   1. Two Independent Authorities:
 *      - AVATAR LOBBY SESSION STATE (INACTIVE vs ACTIVE)
 *      - PUBLIC DISCOVERY / PUBLISH STATE (PRIVATE vs PUBLIC)
 *      These must NEVER be treated as the same boolean.
 *   2. START AVATAR LOBBY:
 *      Default is private: lobbySessionState = ACTIVE, publicationState = PRIVATE.
 *      No camera, mic, or GO LIVE required. User can move, interact, use HUD,
 *      messaging, monitors, and emotes without being publicly broadcast or discoverable.
 *   3. GO PRIVATE ≠ END AVATAR LOBBY:
 *      GO PRIVATE unpublishes from discovery but KEEPS the avatar lobby session running,
 *      KEEPS avatar state, KEEPS current venue, KEEPS HUD, KEEPS private social state.
 *      Never unmounts or resets the runtime.
 *   4. END AVATAR LOBBY:
 *      Distinct termination action that unpublishes (if public), clears state, and returns to Fan Hub.
 *   5. WATCH IN MY LOBBY vs ENTER / WARP:
 *      - WATCH: binds experience to lobby monitor; Fan presence remains in Avatar Lobby.
 *      - WARP: performs starfield/teleport transition; Fan enters destination audience/venue.
 *   6. LEAVE / RETURN TO MY LOBBY:
 *      Restores prior Fan Avatar Lobby state, avatar position, and strictly preserves
 *      prior private/public status (never accidentally turning private lobbies public).
 *   7. BACK / SHOW UI ≠ LEAVE:
 *      Reveals workspace UI without leaving the experience or dropping WebRTC/presence.
 */

import { create } from "zustand";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";

export type LobbySessionState = "INACTIVE" | "ACTIVE";
export type LobbyPublicationState = "PRIVATE" | "PUBLIC";
export type LobbyExperienceState = "NONE" | "WATCHING_IN_LOBBY" | "TRAVELED_TO_DESTINATION";

export interface WatchedExperienceInfo {
  roomId: string;
  title: string;
  experienceType?: string;
  streamUrl?: string | null;
  hostName?: string;
}

export interface TraveledDestinationInfo {
  roomId: string;
  title: string;
  experienceType?: string;
  zone?: string;
  hostName?: string;
  seatId?: string | null;
}

export interface OriginLobbySnapshot {
  roomId: string;
  publicationState: LobbyPublicationState;
  avatarPosition?: [number, number, number];
  hudAutoHide?: boolean;
  timestamp: number;
}

export interface FanAvatarLobbyState {
  lobbySessionState: LobbySessionState;
  publicationState: LobbyPublicationState;
  experienceState: LobbyExperienceState;
  activeRoomId: string | null;
  watchedExperience: WatchedExperienceInfo | null;
  traveledDestination: TraveledDestinationInfo | null;
  originSnapshot: OriginLobbySnapshot | null;
  hudAutoHide: boolean;
  hudKeepOn: boolean;
  isTeleporting: boolean;
  teleportTargetName: string | null;

  // Actions
  startAvatarLobby: (userId: string, options?: { roomId?: string }) => void;
  goPublic: () => Promise<boolean>;
  goPrivate: () => void;
  endAvatarLobby: () => void;
  watchInLobby: (experience: WatchedExperienceInfo) => void;
  clearWatchedExperience: () => void;
  beginWarp: (destination: TraveledDestinationInfo) => void;
  completeWarp: () => void;
  returnToLobby: () => { restoredRoomId: string; priorPublication: LobbyPublicationState } | null;
  toggleHudAutoHide: () => void;
  setHudKeepOn: (keepOn: boolean) => void;
}

export const useFanAvatarLobbyStore = create<FanAvatarLobbyState>((set, get) => ({
  lobbySessionState: "INACTIVE",
  publicationState: "PRIVATE",
  experienceState: "NONE",
  activeRoomId: null,
  watchedExperience: null,
  traveledDestination: null,
  originSnapshot: null,
  hudAutoHide: false,
  hudKeepOn: true,
  isTeleporting: false,
  teleportTargetName: null,

  startAvatarLobby: (userId: string, options) => {
    const roomId = options?.roomId ?? `fan-lobby-${userId}`;
    set({
      lobbySessionState: "ACTIVE",
      publicationState: "PRIVATE",
      experienceState: "NONE",
      activeRoomId: roomId,
      watchedExperience: null,
      traveledDestination: null,
      originSnapshot: null,
      isTeleporting: false,
      teleportTargetName: null,
    });
  },

  goPublic: async () => {
    const { lobbySessionState, activeRoomId } = get();
    if (lobbySessionState !== "ACTIVE" || !activeRoomId) {
      console.warn("[FanAvatarLobbyStore] Cannot GO PUBLIC: avatar lobby is not active.");
      return false;
    }

    // Mark public in live privacy state and sync discovery
    try {
      useLivePrivacyState.getState().markLivePublished(activeRoomId);
      set({ publicationState: "PUBLIC" });
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:fan-lobby:public-change", {
            detail: { roomId: activeRoomId, state: "PUBLIC" },
          }),
        );
      }
      return true;
    } catch (err) {
      console.error("[FanAvatarLobbyStore] GO PUBLIC error:", err);
      return false;
    }
  },

  goPrivate: () => {
    const { activeRoomId, lobbySessionState } = get();
    if (lobbySessionState !== "ACTIVE") return;

    // Unpublish from discovery but KEEP session active!
    // CRITICAL LAW: GO PRIVATE ≠ END AVATAR LOBBY
    useLivePrivacyState.getState().clearLivePublished();
    set({ publicationState: "PRIVATE" });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:fan-lobby:public-change", {
          detail: { roomId: activeRoomId, state: "PRIVATE" },
        }),
      );
    }
  },

  endAvatarLobby: () => {
    const { activeRoomId, publicationState } = get();
    if (publicationState === "PUBLIC") {
      useLivePrivacyState.getState().clearLivePublished();
    }

    set({
      lobbySessionState: "INACTIVE",
      publicationState: "PRIVATE",
      experienceState: "NONE",
      activeRoomId: null,
      watchedExperience: null,
      traveledDestination: null,
      originSnapshot: null,
      isTeleporting: false,
      teleportTargetName: null,
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:fan-lobby:ended", {
          detail: { roomId: activeRoomId },
        }),
      );
    }
  },

  watchInLobby: (experience) => {
    set({
      experienceState: "WATCHING_IN_LOBBY",
      watchedExperience: experience,
    });
  },

  clearWatchedExperience: () => {
    set({
      experienceState: "NONE",
      watchedExperience: null,
    });
  },

  beginWarp: (destination) => {
    const { activeRoomId, publicationState, hudAutoHide } = get();
    // Snapshot origin state before warping so return is lossless
    const snapshot: OriginLobbySnapshot = {
      roomId: activeRoomId ?? "fan-lobby",
      publicationState,
      hudAutoHide,
      timestamp: Date.now(),
    };

    set({
      originSnapshot: snapshot,
      isTeleporting: true,
      teleportTargetName: destination.title || destination.roomId,
      traveledDestination: destination,
    });
  },

  completeWarp: () => {
    set({
      isTeleporting: false,
      teleportTargetName: null,
      experienceState: "TRAVELED_TO_DESTINATION",
    });
  },

  returnToLobby: () => {
    const { originSnapshot } = get();
    if (!originSnapshot) {
      return null;
    }

    const restoredRoomId = originSnapshot.roomId;
    const priorPublication = originSnapshot.publicationState;

    set({
      lobbySessionState: "ACTIVE",
      publicationState: priorPublication,
      experienceState: "NONE",
      activeRoomId: restoredRoomId,
      traveledDestination: null,
      isTeleporting: false,
      teleportTargetName: null,
      originSnapshot: null,
    });

    // Ensure publication state matches prior state exactly
    if (priorPublication === "PUBLIC") {
      useLivePrivacyState.getState().markLivePublished(restoredRoomId);
    } else {
      useLivePrivacyState.getState().clearLivePublished();
    }

    return { restoredRoomId, priorPublication };
  },

  toggleHudAutoHide: () => {
    set((s) => ({ hudAutoHide: !s.hudAutoHide }));
  },

  setHudKeepOn: (keepOn) => {
    set({ hudKeepOn: keepOn });
  },
}));
