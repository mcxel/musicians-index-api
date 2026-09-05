/**
 * GO LIVE bootstrap state machine — one session path through media + venue + HUD.
 * IDLE → REQUESTING_MEDIA → SESSION_CREATED → VENUE_RESOLVING → VENUE_LOADING → HUD_MOUNTING → READY | ERROR
 */

"use client";

import { create } from "zustand";

export type GoLiveBootstrapPhase =
  | "IDLE"
  | "REQUESTING_MEDIA"
  | "SESSION_CREATED"
  | "VENUE_RESOLVING"
  | "VENUE_LOADING"
  | "HUD_MOUNTING"
  | "READY"
  | "ERROR";

export type GoLiveBootstrapErrorCode =
  | "MEDIA_DENIED"
  | "MEDIA_TIMEOUT"
  | "MEDIA_UNAVAILABLE"
  | "SESSION_MINT_FAILED"
  | "VENUE_RESOLVE_FAILED"
  | "VENUE_LOAD_FAILED"
  | "HUD_MOUNT_FAILED"
  | "UNKNOWN";

export interface GoLiveBootstrapState {
  phase: GoLiveBootstrapPhase;
  roomId: string | null;
  liveSessionId: string | null;
  errorCode: GoLiveBootstrapErrorCode | null;
  errorMessage: string | null;
  selfPreviewReady: boolean;
  venueReady: boolean;
  hudReady: boolean;
  startedAt: number | null;
  setPhase: (phase: GoLiveBootstrapPhase) => void;
  begin: (roomId: string) => void;
  markSelfPreview: (ready: boolean) => void;
  markVenueReady: (ready: boolean) => void;
  markHudReady: (ready: boolean) => void;
  setSession: (roomId: string, liveSessionId?: string | null) => void;
  fail: (code: GoLiveBootstrapErrorCode, message: string) => void;
  ready: () => void;
  reset: () => void;
}

const INITIAL = {
  phase: "IDLE" as GoLiveBootstrapPhase,
  roomId: null as string | null,
  liveSessionId: null as string | null,
  errorCode: null as GoLiveBootstrapErrorCode | null,
  errorMessage: null as string | null,
  selfPreviewReady: false,
  venueReady: false,
  hudReady: false,
  startedAt: null as number | null,
};

export const useGoLiveBootstrapStore = create<GoLiveBootstrapState>((set, get) => ({
  ...INITIAL,

  setPhase: (phase) => set({ phase }),

  begin: (roomId) =>
    set({
      ...INITIAL,
      phase: "REQUESTING_MEDIA",
      roomId,
      liveSessionId: roomId,
      startedAt: Date.now(),
    }),

  markSelfPreview: (ready) => {
    set({ selfPreviewReady: ready });
    const { phase } = get();
    if (ready && (phase === "REQUESTING_MEDIA" || phase === "SESSION_CREATED")) {
      // Self preview can surface before venue finishes — stay in current phase
    }
  },

  markVenueReady: (ready) => set({ venueReady: ready }),

  markHudReady: (ready) => set({ hudReady: ready }),

  setSession: (roomId, liveSessionId) =>
    set({
      roomId,
      liveSessionId: liveSessionId ?? roomId,
      phase: "SESSION_CREATED",
      errorCode: null,
      errorMessage: null,
    }),

  fail: (code, message) =>
    set({
      phase: "ERROR",
      errorCode: code,
      errorMessage: message,
    }),

  ready: () =>
    set({
      phase: "READY",
      venueReady: true,
      hudReady: true,
      errorCode: null,
      errorMessage: null,
    }),

  reset: () => set({ ...INITIAL }),
}));

/** Map getUserMedia failures to machine-readable codes. */
export function mediaErrorToBootstrapCode(err?: string | null): GoLiveBootstrapErrorCode {
  const m = (err ?? "").toLowerCase();
  if (m.includes("denied") || m.includes("permission")) return "MEDIA_DENIED";
  if (m.includes("timeout") || m.includes("timed out")) return "MEDIA_TIMEOUT";
  if (m.includes("camera") || m.includes("mic") || m.includes("media")) return "MEDIA_UNAVAILABLE";
  return "UNKNOWN";
}
