/**
 * Record Ralph — World Dance Party Session Opener
 * First 5 minutes of scripted host dialogue for Phase 1 live sessions.
 * Designed to make the room feel alive the moment the first real user walks in.
 * Feed lines through RecordRalphEngine / chat overlay / TTS in sequence.
 */

export interface OpenerLine {
  /** Seconds from session start to deliver this line */
  atSecond: number;
  /** Who delivers it */
  speaker: "ralph" | "system" | "ghost-bot";
  /** The line */
  text: string;
  /** Ralph animation state to trigger alongside the line */
  animState?: "idle-groove" | "crowd-scan" | "mixing" | "ignition" | "drop-pose";
  /** If true, display on the Jumbotron / room-wide banner */
  jumbotron?: boolean;
}

/**
 * The canonical 5-minute opener sequence for World Dance Party.
 * atSecond is relative to when the session is marked LIVE.
 */
export const WORLD_DANCE_PARTY_OPENER: OpenerLine[] = [
  // ── Pre-arrival (room warming up) ──────────────────────────────────
  {
    atSecond: 0,
    speaker: "system",
    text: "🎤 WORLD DANCE PARTY — GOING LIVE",
    animState: "idle-groove",
    jumbotron: true,
  },
  {
    atSecond: 8,
    speaker: "ralph",
    text: "Yo. World Dance Party is live. I'm Record Ralph — I run this room every day. You showed up. Let's get it.",
    animState: "crowd-scan",
  },
  {
    atSecond: 20,
    speaker: "ralph",
    text: "Grab your seat if you haven't. Front row hits different — just saying.",
    animState: "idle-groove",
  },

  // ── First ghost bot arrives (30–45s per BotDripEmitter schedule) ───
  // (Ghost Force V1 handles this automatically — no script needed)

  // ── One minute mark ────────────────────────────────────────────────
  {
    atSecond: 60,
    speaker: "ralph",
    text: "I've been doing this since before your timeline existed. Today's challenge: keep up with whatever I drop next.",
    animState: "mixing",
  },
  {
    atSecond: 75,
    speaker: "system",
    text: "🎯 TODAY'S CHALLENGE ACTIVE",
    jumbotron: true,
  },

  // ── Two minute mark — crowd read ───────────────────────────────────
  {
    atSecond: 120,
    speaker: "ralph",
    text: "I'm reading the room right now. If the energy drops — I notice. If it goes up — I reward it.",
    animState: "crowd-scan",
  },
  {
    atSecond: 138,
    speaker: "ralph",
    text: "Tips go directly to me. Not a joke. Artists and DJs get paid in here. That's the point of TMI.",
    animState: "mixing",
  },

  // ── Three minute mark — heat check ────────────────────────────────
  {
    atSecond: 180,
    speaker: "ralph",
    text: "Alright. Heat is at a certain level right now. Keep reacting, keep sending, and we might hit Ignition before the end of this set.",
    animState: "mixing",
    jumbotron: false,
  },
  {
    atSecond: 200,
    speaker: "system",
    text: "🔥 IGNITION AVAILABLE — Build crowd heat to unlock",
    jumbotron: true,
  },

  // ── Four minute mark — lock in ──────────────────────────────────────
  {
    atSecond: 240,
    speaker: "ralph",
    text: "Battles start soon. Cyphers are open. The Billboard tracks who's real and who's not. You're already here — that's step one.",
    animState: "mixing",
  },

  // ── Five minute mark — full ignition attempt ───────────────────────
  {
    atSecond: 290,
    speaker: "ralph",
    text: "This is the drop. Right here. If you're in — make some noise. Let me see the room react.",
    animState: "ignition",
    jumbotron: true,
  },
  {
    atSecond: 300,
    speaker: "system",
    text: "🌟 WORLD DANCE PARTY — FULL IGNITION",
    animState: "ignition",
    jumbotron: true,
  },
];

/**
 * Returns all opener lines that should fire at or before the given elapsed seconds.
 * Call this on a ticker to deliver lines in sequence.
 */
export function getOpenerLinesUpTo(
  elapsedSeconds: number,
): OpenerLine[] {
  return WORLD_DANCE_PARTY_OPENER.filter((l) => l.atSecond <= elapsedSeconds);
}

/**
 * Returns the single line that fires at exactly this second (±1s window).
 * Use this for real-time delivery on a 1s interval tick.
 */
export function getOpenerLineAt(elapsedSeconds: number): OpenerLine | null {
  return (
    WORLD_DANCE_PARTY_OPENER.find(
      (l) => Math.abs(l.atSecond - elapsedSeconds) <= 1,
    ) ?? null
  );
}

/**
 * Total duration of the opener sequence in seconds.
 */
export const OPENER_DURATION_SECONDS =
  WORLD_DANCE_PARTY_OPENER[WORLD_DANCE_PARTY_OPENER.length - 1]!.atSecond;
