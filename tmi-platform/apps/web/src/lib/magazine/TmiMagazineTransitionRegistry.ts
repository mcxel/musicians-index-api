export type TmiCoverExitTransition =
  | "fade"
  | "dust-dissolve"
  | "page-peel-vanish"
  | "neon-collapse"
  | "flash-vanish";

export type TmiCoverEntryTransition =
  | "fade-in"
  | "flutter-in"
  | "shine-reveal"
  | "spin-settle"
  | "light-burst"
  | "snap-open";

const EXIT_TRANSITIONS: TmiCoverExitTransition[] = [
  "fade",
  "dust-dissolve",
  "page-peel-vanish",
  "neon-collapse",
  "flash-vanish",
];

const ENTRY_TRANSITIONS: TmiCoverEntryTransition[] = [
  "fade-in",
  "flutter-in",
  "shine-reveal",
  "spin-settle",
  "light-burst",
  "snap-open",
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

export function pickRandomExitTransition(): TmiCoverExitTransition {
  return pickRandom(EXIT_TRANSITIONS);
}

export function pickRandomEntryTransition(): TmiCoverEntryTransition {
  return pickRandom(ENTRY_TRANSITIONS);
}

export function pickRandomExitMs(): number {
  return 1000 + Math.floor(Math.random() * 1001);
}

export function pickRandomEntryMs(): number {
  return 1000 + Math.floor(Math.random() * 2001);
}
