import { create } from "zustand";
import { DEFAULT_MONITOR_A, type MonitorTarget } from "@/lib/personal-media/types";

/** LEGACY warp flag — starburst authority moved to MediaTransitionDirector. */

export type InPlaceGoLiveSession = {
  roomId: string;
  category: string;
  privacy: string;
  href?: string;
  /** Daily.co / server-kit room URL when minted — persists with hub session. */
  roomUrl?: string | null;
  venueEnvironment?: "indoor" | "outdoor" | null;
};

interface GoLiveTransitionState {
  isActive: boolean;
  assignedMonitor: MonitorTarget;
  inPlace: InPlaceGoLiveSession | null;
  activate: (monitor?: MonitorTarget) => void;
  bindInPlace: (session: InPlaceGoLiveSession, monitor?: MonitorTarget) => void;
  clear: () => void;
  clearWarp: () => void;
  releaseInPlace: () => void;
}

export const useGoLiveTransition = create<GoLiveTransitionState>((set) => ({
  isActive: false,
  assignedMonitor: DEFAULT_MONITOR_A,
  inPlace: null,
  activate: (monitor) => {
    void import("@/lib/live/MediaTransitionDirector").then(({ useMediaTransitionDirector }) => {
      useMediaTransitionDirector.getState().reportLegacyWarpActivate();
    });
    set({
      isActive: false,
      assignedMonitor: monitor ?? DEFAULT_MONITOR_A,
    });
  },
  bindInPlace: (session, monitor) =>
    set((s) => ({
      inPlace: session,
      assignedMonitor: monitor ?? s.assignedMonitor,
    })),
  clear: () => set({ isActive: false }),
  clearWarp: () => {
    void import("@/lib/live/MediaTransitionDirector").then(({ useMediaTransitionDirector }) => {
      useMediaTransitionDirector.getState().cancelStarburst();
    });
    set({ isActive: false });
  },
  releaseInPlace: () => set({ isActive: false, inPlace: null }),
}));
