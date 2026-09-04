"use client";

/**
 * MediaTransitionDirector — canonical GO LIVE presentation gate.
 * Starburst plays ONLY inside the media player region after:
 *   AUTHORIZED → ROOM RESOLVED → MEDIA TRANSITION READY
 * Never mounts on document.body. Max 1 active instance during launch.
 */

import { create } from "zustand";
import {
  LEGACY_STARBURST_CODES,
  TRANSITION_CODES,
  recordMediaTransitionHealth,
} from "@/lib/live/mediaTransitionHealthCodes";
import { TIMING } from "@/lib/motion/timingRegistry";

export type MediaTransitionPhase =
  | "idle"
  | "armed"
  | "playing"
  | "clearing"
  | "done"
  | "failed";

export type ReducedMotionTier = "FULL" | "REDUCED" | "MINIMAL";

export interface MediaTransitionSnapshot {
  phase: MediaTransitionPhase;
  roomId: string | null;
  authorized: boolean;
  roomResolved: boolean;
  mediaTransitionReady: boolean;
  activeInstances: number;
  reducedMotionTier: ReducedMotionTier;
  lastErrorCode: string | null;
  durationMs: number;
}

function resolveReducedMotionTier(): ReducedMotionTier {
  if (typeof window === "undefined") return "FULL";
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (!reduced) return "FULL";
  const highContrast = window.matchMedia?.("(prefers-contrast: more)")?.matches;
  return highContrast ? "MINIMAL" : "REDUCED";
}

interface MediaTransitionState extends MediaTransitionSnapshot {
  markAuthorized: () => void;
  resolveRoom: (roomId: string) => void;
  markMediaTransitionReady: () => void;
  requestStarburst: () => boolean;
  registerInstance: () => () => void;
  completeStarburst: () => void;
  cancelStarburst: (code?: string, message?: string) => void;
  failLaunch: (message: string) => void;
  reportLegacyGlobalMount: (source: string) => void;
  reportLegacyWarpActivate: () => void;
  reset: () => void;
}

const INITIAL: MediaTransitionSnapshot = {
  phase: "idle",
  roomId: null,
  authorized: false,
  roomResolved: false,
  mediaTransitionReady: false,
  activeInstances: 0,
  reducedMotionTier: "FULL",
  lastErrorCode: null,
  durationMs: TIMING.starburstDuration,
};

export const useMediaTransitionDirector = create<MediaTransitionState>((set, get) => ({
  ...INITIAL,

  markAuthorized: () =>
    set({
      authorized: true,
      reducedMotionTier: resolveReducedMotionTier(),
    }),

  resolveRoom: (roomId) =>
    set({
      roomId,
      roomResolved: Boolean(roomId?.trim()),
    }),

  markMediaTransitionReady: () => set({ mediaTransitionReady: true }),

  requestStarburst: () => {
    const s = get();
    if (!s.authorized) {
      recordMediaTransitionHealth(
        TRANSITION_CODES.UNAUTHORIZED,
        "Starburst blocked — GO LIVE not authorized.",
        s.roomId,
      );
      return false;
    }
    if (!s.roomResolved || !s.roomId) {
      recordMediaTransitionHealth(
        TRANSITION_CODES.ROOM_UNRESOLVED,
        "Starburst blocked — roomId not resolved.",
        s.roomId,
      );
      return false;
    }
    if (!s.mediaTransitionReady) {
      recordMediaTransitionHealth(
        TRANSITION_CODES.MEDIA_NOT_READY,
        "Starburst blocked — media transition not ready.",
        s.roomId,
      );
      return false;
    }
    if (s.activeInstances > 1) {
      recordMediaTransitionHealth(
        TRANSITION_CODES.DUPLICATE_SEQUENCE,
        "Duplicate starburst sequence blocked.",
        s.roomId,
      );
      return false;
    }
    if (s.phase === "playing") return true;

    const tier = s.reducedMotionTier;
    if (tier === "MINIMAL") {
      recordMediaTransitionHealth(
        TRANSITION_CODES.REDUCED_MOTION,
        "Starburst skipped — minimal reduced-motion tier.",
        s.roomId,
      );
      set({ phase: "done", lastErrorCode: TRANSITION_CODES.REDUCED_MOTION });
      return false;
    }

    set({
      phase: "playing",
      durationMs:
        tier === "REDUCED"
          ? Math.min(320, TIMING.starburstDuration)
          : TIMING.starburstDuration,
      lastErrorCode: null,
    });
    return true;
  },

  registerInstance: () => {
    set((s) => {
      const next = s.activeInstances + 1;
      if (next > 1) {
        recordMediaTransitionHealth(
          LEGACY_STARBURST_CODES.DUPLICATE_INSTANCE,
          "Second starburst instance registered during launch.",
          s.roomId,
        );
      }
      return { activeInstances: next };
    });
    let released = false;
    return () => {
      if (released) return;
      released = true;
      set((s) => ({ activeInstances: Math.max(0, s.activeInstances - 1) }));
    };
  },

  completeStarburst: () => {
    const s = get();
    if (s.phase === "playing" && s.activeInstances > 0) {
      recordMediaTransitionHealth(
        TRANSITION_CODES.STUCK_OVERLAY,
        "Starburst complete called while instance still registered.",
        s.roomId,
      );
    }
    set({ phase: "done", activeInstances: 0 });
  },

  cancelStarburst: (code, message) => {
    set({
      phase: "failed",
      activeInstances: 0,
      lastErrorCode: code ?? TRANSITION_CODES.LAUNCH_FAILED,
    });
    if (code && message) {
      recordMediaTransitionHealth(
        code as import("@/lib/live/mediaTransitionHealthCodes").MediaTransitionHealthCode,
        message,
        get().roomId,
      );
    }
  },

  failLaunch: (message) => {
    get().cancelStarburst(TRANSITION_CODES.LAUNCH_FAILED, message);
  },

  reportLegacyGlobalMount: (source) => {
    recordMediaTransitionHealth(
      LEGACY_STARBURST_CODES.GLOBAL_BODY_MOUNT,
      `Legacy global starburst mount: ${source}`,
      get().roomId,
    );
  },

  reportLegacyWarpActivate: () => {
    recordMediaTransitionHealth(
      LEGACY_STARBURST_CODES.LEGACY_WARP_ACTIVATE,
      "Legacy goLiveTransition.activate() invoked.",
      get().roomId,
    );
  },

  reset: () => set({ ...INITIAL, reducedMotionTier: resolveReducedMotionTier() }),
}));

export function getMediaTransitionSnapshot(): MediaTransitionSnapshot {
  const s = useMediaTransitionDirector.getState();
  return {
    phase: s.phase,
    roomId: s.roomId,
    authorized: s.authorized,
    roomResolved: s.roomResolved,
    mediaTransitionReady: s.mediaTransitionReady,
    activeInstances: s.activeInstances,
    reducedMotionTier: s.reducedMotionTier,
    lastErrorCode: s.lastErrorCode,
    durationMs: s.durationMs,
  };
}
