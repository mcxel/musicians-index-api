// apps/web/src/lib/shows/monday-night/marcelsMondayNight.engine.ts
// Show loop engine for Marcel's Monday Night Stage.
// Kira hosts. Bebo enforces. Crowd votes/boos. Comeback bonus possible.

export type ShowPhase =
  | "pre_show"
  | "kira_intro"
  | "contestant_performance"
  | "crowd_pressure_active"
  | "recovery_window"
  | "bebo_entrance"
  | "elimination"
  | "survival_bonus"
  | "inter_act_break"
  | "finale"
  | "recap";

export interface EpisodeState {
  phase: ShowPhase;
  currentContestant: string | null;
  contestantQueue: string[];
  booMeterPressure: number;
  beboEntrances: number;     // how many times Bebo has appeared
  currentCostume: string | null;
  survivorBonus: boolean;    // did current contestant survive heavy boos?
  episodeWinner: string | null;
  sponsorSlots: string[];
  viewerCount: number;
  phaseStartedAt: Date;
}

// Episode structure: intro → 3 performers → break → 2 more → finale
export const EPISODE_STRUCTURE: ShowPhase[] = [
  "pre_show",
  "kira_intro",
  "contestant_performance",  // Contestant 1
  "inter_act_break",
  "contestant_performance",  // Contestant 2
  "inter_act_break",
  "contestant_performance",  // Contestant 3
  "inter_act_break",
  "contestant_performance",  // Contestant 4
  "finale",
  "recap",
];

export function getKiraScript(phase: ShowPhase, pressure: number): string {
  const scripts: Record<ShowPhase, string> = {
    kira_intro:             "G'day everyone and welcome to Marcel's Monday Night Stage! I'm Kira, and tonight is gonna be EPIC. Let's bring out our first performer!",
    contestant_performance: "The stage is yours — make it count!",
    crowd_pressure_active:  pressure > 60
      ? "Oi! The crowd's not feeling it — you've got about twenty seconds to turn this around, love!"
      : "Heads up — the crowd's getting a bit restless. Show 'em what you've really got!",
    recovery_window:        "This is your LAST CHANCE. Dig deep — the crowd wants to love you!",
    bebo_entrance:          "Welp... Bebo's been called. You know what that means. Don't take it personally — the crowd made their choice.",
    elimination:            "Better luck next time! There's always next Monday, and the crowd respects the effort.",
    survival_bonus:         "WAIT — look at that! They turned it around! The crowd is BACK! Bonus points for the comeback!",
    inter_act_break:        "Give it up for that performance! Alright, quick break — and sponsors, the floor is yours.",
    finale:                 "And now — the moment you've all been waiting for. Tonight's winner is...",
    recap:                  "What a show, what a SHOW! Thanks to everyone who performed and everyone who voted. See you next Monday!",
    pre_show:               "Show starts soon. Get your votes ready — and your boos...",
  };
  return scripts[phase] ?? "And the show continues!";
}
