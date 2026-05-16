/**
 * VictoryOverlayEngine
 * Manages the client-side overlay display state for each ceremony phase.
 *
 * Drives:
 * - freeze dimming of room
 * - winner name reveal (typewriter)
 * - crown drop animation trigger
 * - confetti parameters
 * - reward card reveal
 * - replay + article CTA
 *
 * React components subscribe to the overlay state via polling or direct reads.
 */

import type { CeremonyPhase, CeremonyResult } from "./WinnerCeremonyEngine";

export interface OverlayState {
  ceremonyId: string;
  phase: CeremonyPhase;
  /** 0–1, used to animate overlay entrance */
  overlayOpacity: number;
  /** Whether to show the freeze vignette */
  showFreeze: boolean;
  /** Whether to show the declare text */
  showDeclare: boolean;
  /** Whether to animate the crown drop */
  showCrown: boolean;
  /** Whether confetti is active */
  showConfetti: boolean;
  /** Whether the reward card is visible */
  showRewards: boolean;
  /** Whether replay/article CTAs are visible */
  showCtas: boolean;
  /** Winner display name for the reveal text */
  winnerName: string;
  /** Upset label if applicable */
  upsetLabel?: string;
  /** Color accent driven by context */
  accentColor: string;
}

const CONTEXT_COLORS: Record<string, string> = {
  battle:       "#FFD700",
  cypher:       "#FF2DAA",
  "dirty-dozens": "#AA2DFF",
  contest:      "#00FFFF",
};

class VictoryOverlayEngine {
  private states = new Map<string, OverlayState>();

  buildState(ceremony: CeremonyResult): OverlayState {
    const phase = ceremony.currentPhase;
    const accentColor = CONTEXT_COLORS[ceremony.context] ?? "#FFD700";

    const state: OverlayState = {
      ceremonyId: ceremony.ceremonyId,
      phase,
      overlayOpacity: phase === "idle" || phase === "done" ? 0 : 1,
      showFreeze:   phase !== "idle" && phase !== "done",
      showDeclare:  ["declare", "crown", "confetti", "rewards", "replay", "article"].includes(phase),
      showCrown:    ["crown", "confetti", "rewards", "replay", "article"].includes(phase),
      showConfetti: ["confetti", "rewards", "replay", "article"].includes(phase),
      showRewards:  ["rewards", "replay", "article"].includes(phase),
      showCtas:     ["replay", "article", "done"].includes(phase),
      winnerName: ceremony.winner.displayName,
      upsetLabel: ceremony.isUpset ? "UPSET WIN" : undefined,
      accentColor,
    };

    this.states.set(ceremony.ceremonyId, state);
    return state;
  }

  getState(ceremonyId: string): OverlayState | undefined {
    return this.states.get(ceremonyId);
  }

  /** Re-sync state from latest ceremony phase */
  sync(ceremony: CeremonyResult): OverlayState {
    return this.buildState(ceremony);
  }

  clearState(ceremonyId: string): void {
    this.states.delete(ceremonyId);
  }
}

export const victoryOverlayEngine = new VictoryOverlayEngine();
