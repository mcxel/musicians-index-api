// apps/web/src/engines/shows/marcelsMondayNight.engine.ts
// Marcel's Monday Night Stage — Kira hosts, Bebo enforces, boo meter controls fate.

export type BooLevel = 0|1|2|3;   // 0=none, 1=mild, 2=danger, 3=elimination

export interface BooPressureState {
  level: BooLevel;
  booPercent: number;      // 0-100
  cheerPercent: number;    // 0-100
  isWarningActive: boolean;
  isRecoveryWindowOpen: boolean;
  recoverySecondsLeft: number;
  isBeboEntering: boolean;
  selectedCostume: string;
  kiraSpeaking: string | null;   // Kira's current warning message
}

// Stage performance loop — one contestant
export type PerformanceStage =
  | "kira_intro"          // Kira introduces contestant
  | "contestant_performs" // performance happening
  | "crowd_reacting"      // crowd sending boos/cheers
  | "kira_warning"        // Kira warns contestant
  | "recovery_window"     // contestant gets 15s to improve
  | "bebo_enters"         // Bebo appears with new costume
  | "elimination"         // contestant escorted off
  | "survival_bonus"      // survived! bonus points + badge
  | "crowd_break"         // rest between contestants
  | "recap";              // episode recap

export const BOO_THRESHOLDS = {
  MILD_WARNING:      30,  // 30% boos → Kira gives mild warning
  DANGER_WARNING:    55,  // 55% boos → Kira gives danger warning + red lights
  ELIMINATION_GATE:  75,  // 75% boos → Bebo enters
  RECOVERY_WINDOW_S: 15,  // seconds contestant has to recover
  SURVIVAL_THRESHOLD: 40, // boos must drop below 40% in recovery window to survive
} as const;

export const KIRA_LINES = {
  mild: [
    "Ooh honey, the crowd is getting a little restless...",
    "Let's wake 'em up a bit, yeah?",
    "The energy's dropping — give 'em something to scream about!",
  ],
  danger: [
    "Alright, this is NOT looking good. You need to flip this NOW.",
    "The crowd is speaking — are you listening?",
    "Sixty percent boos. Sixty. That's not good, babe. Change it up!",
  ],
  recovery: [
    "You have FIFTEEN SECONDS. Whatever you've been holding back — give it now!",
    "This is your chance. DO NOT waste it.",
    "Come on — I'm rooting for you! But Bebo's watching too...",
  ],
  elimination: [
    "Oh no... Bebo's warming up. I tried to warn you, love.",
    "It was a good run. Bebo? You're up.",
  ],
  survival: [
    "YES! They came back! The crowd is BACK! That's how you do it!",
    "Comeback of the NIGHT! Give it up!",
  ],
};

export const BEBO_COSTUMES = [
  "referee",          // whistle, striped shirt
  "security_guard",   // badge, walkie-talkie
  "tuxedo_butler",    // white gloves, silver tray
  "neon_janitor",     // mop, neon vest
  "ringmaster",       // top hat, coat
  "disco_robot",      // mirror ball, rainbow lights
  "knight",           // medieval armor + TMI crest
  "firefighter",      // helmet, hose
  "retro_game_show_assistant", // 80s outfit, prize wheel
  "chef",             // hat, "you cooked" sign
];

export function selectBeboCostume(): string {
  return BEBO_COSTUMES[Math.floor(Math.random() * BEBO_COSTUMES.length)];
}

export function getKiraLine(stage: "mild" | "danger" | "recovery" | "elimination" | "survival"): string {
  const lines = KIRA_LINES[stage];
  return lines[Math.floor(Math.random() * lines.length)];
}

// Monday Night episode structure
export const EPISODE_TEMPLATE = [
  { stage:"kira_intro",         durationS:60,  notes:"Kira opens the show, introduces the night" },
  { stage:"contestant_performs", durationS:180, notes:"Contestant 1 performance — boo meter live" },
  { stage:"crowd_break",         durationS:30,  notes:"Score reveal, crowd reactions, recap 1" },
  { stage:"contestant_performs", durationS:180, notes:"Contestant 2 performance" },
  { stage:"crowd_break",         durationS:30,  notes:"Score reveal, sponsor slot" },
  { stage:"contestant_performs", durationS:180, notes:"Contestant 3 performance" },
  { stage:"recap",               durationS:120, notes:"Kira + any surviving contestants recap, weekly leaderboard update" },
];

export const PRIZE_STRUCTURE = {
  weekly: {
    survival:   { points:50,  xp:100, badge:"monday_survivor", cashUSD:0 },
    winner:     { points:150, xp:300, badge:"monday_champion", cashUSD:25 },
    comebacker: { points:200, xp:400, badge:"crowd_favorite",  cashUSD:50 },
  },
};
