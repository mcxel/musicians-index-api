import { create } from "zustand";

/**
 * Tiny shared focus pointer: "which title's history was just tapped."
 * Presentation-only — never derives or stores championship truth itself,
 * just lets a click on a belt/crown tell ChampionshipHistoryPanel which
 * ChampionshipTitle id to look up from the real registry.
 */
interface ChampionshipHistoryFocusState {
  focusedTitleId: string | null;
  setFocusedTitleId: (id: string | null) => void;
}

export const useChampionshipHistoryFocus = create<ChampionshipHistoryFocusState>((set) => ({
  focusedTitleId: null,
  setFocusedTitleId: (id) => set({ focusedTitleId: id }),
}));
