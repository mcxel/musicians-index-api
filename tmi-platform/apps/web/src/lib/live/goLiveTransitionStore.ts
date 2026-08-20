import { create } from "zustand";
import { DEFAULT_MONITOR_A, type MonitorTarget } from "@/lib/personal-media/types";

export type InPlaceGoLiveSession = {
  roomId: string;
  category: string;
  privacy: string;
  href?: string;
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
  activate: (monitor) =>
    set({
      isActive: true,
      assignedMonitor: monitor ?? DEFAULT_MONITOR_A,
    }),
  bindInPlace: (session, monitor) =>
    set((s) => ({
      inPlace: session,
      assignedMonitor: monitor ?? s.assignedMonitor,
    })),
  clear: () => set({ isActive: false }),
  clearWarp: () => set({ isActive: false }),
  releaseInPlace: () => set({ isActive: false, inPlace: null }),
}));
