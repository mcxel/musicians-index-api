// apps/web/src/lib/hosts/host.engine.ts
// Controls which host is active, solo vs duo mode, and host scheduling.
// Danny Green and Eddie LaRocca rotate for weekly battles.
// Both appear together for finals, monthly, and yearly events.

import { CHARACTER_REGISTRY, Character } from "@/lib/characters/character.registry";

export type HostAssignment =
  | { mode: "solo";  host: Character }
  | { mode: "duo";   primary: Character; secondary: Character };

export type EventType =
  | "weekly_battle"
  | "monthly_final"
  | "yearly_championship"
  | "deal_or_feud"
  | "monday_night_stage"
  | "game_night"
  | "cypher_arena"
  | "winners_reveal";

// ── WEEKLY HOST SCHEDULE ────────────────────────────────────────
// Pattern C: weighted random with rules
// Solo most nights, duo for finals and special events
export function getHostForEvent(
  eventType: EventType,
  weekdayIndex: number,  // 0=Mon 1=Tue ... 6=Sun
  forceCoHost: boolean = false
): HostAssignment {

  const danny = CHARACTER_REGISTRY.dannyGreen;
  const eddie = CHARACTER_REGISTRY.eddieLaRocca;

  // Duo triggers
  const duoTriggers: EventType[] = ["monthly_final","yearly_championship","winners_reveal"];
  if (forceCoHost || duoTriggers.includes(eventType)) {
    return { mode:"duo", primary:danny, secondary:eddie };
  }

  // Deal or Feud always Bobby Stanley
  if (eventType === "deal_or_feud") {
    return { mode:"solo", host: CHARACTER_REGISTRY.bobbyStanley };
  }

  // Monday Night Stage always Kira
  if (eventType === "monday_night_stage") {
    return { mode:"solo", host: CHARACTER_REGISTRY.kira };
  }

  // Weekly battles alternate: Danny odd days, Eddie even days
  // Sunday (6) = duo reveal
  if (weekdayIndex === 6) {
    return { mode:"duo", primary:danny, secondary:eddie };
  }
  if (weekdayIndex % 2 === 0) {
    return { mode:"solo", host: danny };
  }
  return { mode:"solo", host: eddie };
}

// ── HOST MODES ─────────────────────────────────────────────────
export interface HostDialogueContext {
  assignment: HostAssignment;
  mode: string;
  context?: Record<string, unknown>;
}

export function buildHostDialogue(ctx: HostDialogueContext): string {
  const { assignment, mode } = ctx;

  if (assignment.mode === "duo") {
    // Duo exchanges — Danny is structured, Eddie brings chaos
    const duoExchanges: Record<string, [string, string]> = {
      intro:           ["Alright folks, welcome to the show!", "HOLD ON — they're not ready yet! Let's GOOO!"],
      battle_start:    ["We have two incredible artists ready to battle tonight.", "And I mean INCREDIBLE — both of them are cooking! Let's see who turns it up!"],
      vote_update:     ["Votes are coming in.", "And look at that swing! The crowd is SPEAKING!"],
      winner_reveal:   ["After a hard-fought battle, the winner is...", "Drumroll please... actually forget the drumroll — ANNOUNCE IT DANNY!"],
      sponsor_read:    ["Tonight's battle is brought to you by...", "Give it up for our sponsors — they're keeping the lights on, people!"],
    };
    const exchange = duoExchanges[mode] ?? ["...","..."];
    return `${assignment.primary.name}: "${exchange[0]}"
${assignment.secondary.name}: "${exchange[1]}"`;
  }

  // Solo host dialogue
  const soloLines: Record<string, Record<string, string>> = {
    dannyGreen: {
      intro:  "Right then! Let's get this evening underway, shall we?",
      hype:   "Oh this is brilliant — the energy in here is absolutely electric!",
      reveal: "And the winner is... *dramatic pause* ... you'll have to wait just a moment longer.",
    },
    eddieLaRocca: {
      intro:  "WHAT IS UP everybody! Eddie's in the building and we're about to go OFF tonight!",
      hype:   "Orale! You see what I'm seeing?! This crowd is ALIVE right now!",
      reveal: "Okay okay okay — the votes are locked. You ready? Because I don't think you're READY...",
    },
  };

  const host = assignment.host;
  const lines = soloLines[host.id] ?? {};
  return `${host.name}: "${lines[mode] ?? "Let's do this!"}"`;
}

// ── ROTATION SCHEDULE ─────────────────────────────────────────
// Monday: singers, rappers, comedians
// Tuesday: drummers, guitarists, pianists
// Wednesday: dancers, dance groups, DJs
// Thursday: duos, bands, cypher rappers
// Friday: solo artist showcases + semi-finals
// Saturday: sponsor special / showcase night
// Sunday: winner reveals + monthly qualification update
export const WEEKLY_BATTLE_SCHEDULE = [
  { day:"Monday",    categories:["singer","rapper","comedian"],         host:"solo" },
  { day:"Tuesday",   categories:["drummer","guitarist","pianist"],      host:"solo" },
  { day:"Wednesday", categories:["dancer","dance_group","dj"],         host:"solo" },
  { day:"Thursday",  categories:["duo","band","cypher_rapper"],        host:"solo" },
  { day:"Friday",    categories:["solo_artist","semi_final"],          host:"solo" },
  { day:"Saturday",  categories:["sponsor_special","showcase"],        host:"solo" },
  { day:"Sunday",    categories:["winner_reveal","monthly_qualifier"],  host:"duo"  },
] as const;
