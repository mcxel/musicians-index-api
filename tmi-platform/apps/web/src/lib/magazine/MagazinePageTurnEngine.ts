// ─── MAGAZINE PAGE TURN ENGINE ────────────────────────────────────────────────
// Pure state machine for page-turn animations in the Magazine Shell.
// Tracks: turn direction, flip phase, timing model.
// Used by MagazineShellTransition.tsx and consumed by page route transitions.
// ─────────────────────────────────────────────────────────────────────────────

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type PageTurnDirection = "forward" | "backward";

/** Sequential phases of a single page-flip animation */
export type PageFlipPhase =
  | "idle"        // No animation in progress
  | "accelerate"  // Slight page bow before lift-off
  | "fold"        // Page curls from flat → 45° 
  | "edge"        // Page at 90° (edge-on, content hidden)
  | "swap"        // Content swap fires here (invisible at edge-on)
  | "return"      // New page uncurls from 90° → flat
  | "settle";     // Micro-bounce settle before idle

// ─── TIMING MODELS ───────────────────────────────────────────────────────────

export interface PageFlipTimings {
  accelerateMs: number;
  foldMs: number;
  edgeMs: number;
  swapMs: number;
  returnMs: number;
  settleMs: number;
  /** Total duration of the full flip cycle */
  totalMs: number;
}

/** Timing presets per direction — backward is slightly faster (feels natural) */
export const PAGE_FLIP_TIMINGS: Record<PageTurnDirection, PageFlipTimings> = {
  forward: {
    accelerateMs: 90,
    foldMs: 230,
    edgeMs: 295,
    swapMs: 335,
    returnMs: 560,
    settleMs: 620,
    totalMs: 680,
  },
  backward: {
    accelerateMs: 75,
    foldMs: 175,
    edgeMs: 230,
    swapMs: 265,
    returnMs: 460,
    settleMs: 510,
    totalMs: 560,
  },
};

// ─── CSS TRANSFORM MODEL ─────────────────────────────────────────────────────
// Maps a flip phase + direction → CSS transform string for the page surface.

export function getPageFlipTransform(
  phase: PageFlipPhase,
  direction: PageTurnDirection
): string {
  const sign = direction === "forward" ? -1 : 1;

  switch (phase) {
    case "idle":
    case "settle":
      return "rotateY(0deg) scale(1)";
    case "accelerate":
      return `rotateY(${sign * 4}deg) scale(0.995)`;
    case "fold":
      return `rotateY(${sign * 45}deg) scale(0.97)`;
    case "edge":
    case "swap":
      return `rotateY(${sign * 90}deg) scale(0.94)`;
    case "return":
      return `rotateY(${sign * 8}deg) scale(0.99)`;
  }
}

/** Opacity during flip — content is invisible at the edge-on moment */
export function getPageFlipOpacity(phase: PageFlipPhase): number {
  switch (phase) {
    case "idle":
    case "settle":
    case "accelerate":
    case "return":
      return 1;
    case "fold":
      return 0.6;
    case "edge":
    case "swap":
      return 0;
  }
}

// ─── PHASE SCHEDULER ─────────────────────────────────────────────────────────
// Returns a sorted list of { delayMs, phase } entries for a full flip cycle.
// Consumers iterate these to schedule setPhase() calls via setTimeout.

export interface PhaseScheduleEntry {
  delayMs: number;
  phase: PageFlipPhase;
}

export function buildPhaseSchedule(
  direction: PageTurnDirection
): PhaseScheduleEntry[] {
  const t = PAGE_FLIP_TIMINGS[direction];
  return [
    { delayMs: 0,           phase: "accelerate" },
    { delayMs: t.accelerateMs, phase: "fold"    },
    { delayMs: t.foldMs,    phase: "edge"        },
    { delayMs: t.edgeMs,    phase: "swap"        },
    { delayMs: t.swapMs,    phase: "return"      },
    { delayMs: t.returnMs,  phase: "settle"      },
    { delayMs: t.settleMs,  phase: "idle"        },
  ];
}

// ─── INPUT DEVICE MAP ─────────────────────────────────────────────────────────
// Canonical input source → direction mapping.
// Consumers call resolveInputDirection() on raw events.

export type PageTurnInput =
  | "SWIPE_LEFT"
  | "SWIPE_RIGHT"
  | "ARROW_RIGHT"
  | "ARROW_LEFT"
  | "NAV_BUTTON_FORWARD"
  | "NAV_BUTTON_BACKWARD"
  | "KEYBOARD_N"      // N = Next page
  | "KEYBOARD_P"      // P = Previous page
  | "GAMEPAD_RIGHT"
  | "GAMEPAD_LEFT";

export function resolveInputDirection(input: PageTurnInput): PageTurnDirection {
  switch (input) {
    case "SWIPE_LEFT":
    case "ARROW_RIGHT":
    case "NAV_BUTTON_FORWARD":
    case "KEYBOARD_N":
    case "GAMEPAD_RIGHT":
      return "forward";

    case "SWIPE_RIGHT":
    case "ARROW_LEFT":
    case "NAV_BUTTON_BACKWARD":
    case "KEYBOARD_P":
    case "GAMEPAD_LEFT":
      return "backward";
  }
}

// ─── PAGE SPREAD MODEL ───────────────────────────────────────────────────────
// Defines a two-page spread (left + right surface content keys).

export interface PageSpread {
  spreadIndex: number;
  /** Route for this spread — consumed by nav after turn */
  route: string;
  leftSurface: string;  // content key / component id for left page
  rightSurface: string; // content key / component id for right page
  spreadLabel: string;
}

/** Canonical spread sequence for the magazine world */
export const MAGAZINE_SPREADS: PageSpread[] = [
  { spreadIndex: 0, route: "/home/1-2", leftSurface: "top10-left",     rightSurface: "top10-right",     spreadLabel: "Top 10 · Rising Artists"    },
  { spreadIndex: 1, route: "/home/2",   leftSurface: "news",            rightSurface: "cypher-arena",     spreadLabel: "News & Cypher Arena"        },
  { spreadIndex: 2, route: "/home/3",   leftSurface: "live-venues",     rightSurface: "sponsors",         spreadLabel: "Live Venues & Sponsors"     },
  { spreadIndex: 3, route: "/home/4",   leftSurface: "billboards",      rightSurface: "booking",          spreadLabel: "Billboard Charts & Booking" },
  { spreadIndex: 4, route: "/home/5",   leftSurface: "marketplace",     rightSurface: "fan-club",         spreadLabel: "Marketplace & Fan Club"     },
];

export function getSpreadByRoute(route: string): PageSpread | undefined {
  return MAGAZINE_SPREADS.find((s) => s.route === route);
}

export function getAdjacentSpread(
  currentRoute: string,
  direction: PageTurnDirection
): PageSpread | undefined {
  const idx = MAGAZINE_SPREADS.findIndex((s) => s.route === currentRoute);
  if (idx === -1) return undefined;
  const nextIdx = direction === "forward" ? idx + 1 : idx - 1;
  return MAGAZINE_SPREADS[nextIdx];
}
