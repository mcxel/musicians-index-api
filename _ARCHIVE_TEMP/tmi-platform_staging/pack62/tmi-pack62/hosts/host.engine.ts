// apps/web/src/engines/hosts/host.engine.ts
// Controls which host is active, solo vs duo mode, and dialogue handoffs.
// PATTERN C: weighted random with rules (alternating, co-host for finals)

import { CharacterId, CHARACTER_REGISTRY, HostMode } from "../characters/character.registry";

export type HostAssignment = {
  primary: CharacterId;
  secondary?: CharacterId;    // undefined = solo
  mode: "solo" | "duo";
  eventType: string;
};

// ── SHOW TYPE → HOST ASSIGNMENT ─────────────────────────────────
const SHOW_HOST_RULES: Record<string, (weekNumber: number) => HostAssignment> = {
  "weekly_battle": (week) => {
    // Alternate Danny/Eddie each day, both for Sunday finals
    const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon...
    if (dayOfWeek === 0) return { primary:"danny_green", secondary:"eddie_larocca", mode:"duo", eventType:"weekly_finals" };
    const isEddie = (dayOfWeek + week) % 2 === 0;
    return { primary: isEddie ? "eddie_larocca" : "danny_green", mode:"solo", eventType:"weekly_battle" };
  },
  "monthly_finals":  () => ({ primary:"danny_green", secondary:"eddie_larocca", mode:"duo", eventType:"monthly_finals" }),
  "yearly_championship": () => ({ primary:"danny_green", secondary:"eddie_larocca", mode:"duo", eventType:"yearly_championship" }),
  "monday_night":    () => ({ primary:"kira", mode:"solo", eventType:"monday_night" }),
  "monthly_idol":    () => ({ primary:"monthly_idol_host_1", secondary:"monthly_idol_host_2", mode:"duo", eventType:"monthly_idol" }),
  "cypher":          () => {
    const isEddie = Math.random() > 0.5;
    return { primary: isEddie ? "eddie_larocca" : "danny_green", mode:"solo", eventType:"cypher" };
  },
};

export function getHostAssignment(showType: string, weekNumber = 1): HostAssignment {
  const rule = SHOW_HOST_RULES[showType];
  if (!rule) return { primary:"danny_green", mode:"solo", eventType:showType };
  return rule(weekNumber);
}

// ── DIALOGUE EXCHANGE SYSTEM ─────────────────────────────────────
// Pre-scripted dynamic duo exchanges
export const DUO_EXCHANGES = [
  {
    trigger:"round_start",
    danny: "Alright folks, we've got another showdown brewing...",
    eddie: "WAIT—hold up, they not ready yet! Let me hear it from the crowd! *claps*",
    timing_ms: 4000,
  },
  {
    trigger:"contestant_intro",
    danny: "Coming to the stage, representing ${genre}...",
    eddie: "Aye, I saw this one warming up backstage — ${hypeLevel}!",
    timing_ms: 3500,
  },
  {
    trigger:"close_vote",
    danny: "This is extremely close, folks.",
    eddie: "Close?? Bro this is NECK AND NECK. My heart is literally, I can't—",
    timing_ms: 3000,
  },
  {
    trigger:"winner_reveal",
    danny: "After tallying all votes, your winner is...",
    eddie: "Danny man — they waitin', just say it! *crowd laughing*",
    timing_ms: 5000,
  },
  {
    trigger:"sponsor_read_danny",
    danny: "Tonight's battle is proudly presented by ${sponsorName}.",
    eddie: "Shoutout ${sponsorName}! We see you, appreciate you, this one's sponsored right!",
    timing_ms: 3500,
  },
];

// ── HOST MODE RULES ───────────────────────────────────────────────
export function getHostModeForEvent(event: string): HostMode {
  const MODE_MAP: Record<string, HostMode> = {
    "show_intro":       "intro",
    "battle_active":    "battle",
    "crowd_low":        "hype",
    "joke_moment":      "comedy",
    "results":          "serious_results",
    "sponsor_moment":   "sponsor_read",
    "winner_reveal":    "winner_reveal",
    "show_recap":       "recap",
  };
  return MODE_MAP[event] ?? "intro";
}

// ── JULIUS ASSISTANCE MODE ────────────────────────────────────────
// Julius can assist any host at any time
export const JULIUS_ASSIST_TRIGGERS = [
  "user_onboarding",
  "rule_question",
  "points_question",
  "sponsor_question",
  "navigation_help",
  "battle_rules",
  "achievement_unlock",
  "reward_claim",
];

export function shouldJuliusAssist(event: string): boolean {
  return JULIUS_ASSIST_TRIGGERS.includes(event);
}
