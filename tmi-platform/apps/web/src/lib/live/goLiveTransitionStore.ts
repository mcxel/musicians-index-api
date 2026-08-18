import { create } from "zustand";

interface GoLiveTransitionState {
  isActive: boolean;
  activate: () => void;
  clear: () => void;
}

export const useGoLiveTransition = create<GoLiveTransitionState>((set) => ({
  isActive: false,
  activate: () => set({ isActive: true }),
  clear: () => set({ isActive: false }),
}));
