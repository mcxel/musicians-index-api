/**
 * Format / performer / instrument / genre → round timing profiles.
 *
 * Feeds AuthoritativeRoomTimingContract.roundDurationSeconds — does NOT create
 * a second competition clock. Event config overrides always win when published.
 *
 * Axes (never collapsed into one universal stopwatch):
 *   Performer type · Instrument · Genre · Authorized format profile
 */

export const DUPLICATE_COMPETITION_TIMER_ENGINE = 0 as const;

export type CompetitionPerformerType =
  | "rapper"
  | "singer"
  | "dj"
  | "instrumentalist"
  | "band"
  | "producer"
  | "comedian"
  | "dancer"
  | "mixed";

export type CompetitionInstrument =
  | "voice"
  | "turntables"
  | "guitar"
  | "piano"
  | "drums"
  | "saxophone"
  | "violin"
  | "bass"
  | "beatbox"
  | "other"
  | "ensemble";

export type CompetitionTimingMode =
  | "BEAT_DRIVEN_RAP"
  | "ACAPELLA_FREESTYLE"
  | "ACAPELLA_SHORT_30"
  | "ACAPELLA_SHORT_45"
  | "SINGING_VOCAL"
  | "DJ_TURNTABLES"
  | "INSTRUMENT_SOLO_45"
  | "INSTRUMENT_SOLO_60"
  | "INSTRUMENT_SOLO_120"
  | "DRUMS_BARS_4"
  | "DRUMS_BARS_8"
  | "TRADING_BARS"
  | "PRODUCER_BEAT_BATTLE"
  | "BAND_VS_BAND"
  | "CYPHER_ROTATION"
  | "SONG_CHALLENGE"
  | "COMEDY_BATTLE"
  | "OPEN_MIXED"
  | "OBJECTIVE_CHALLENGE";

export type TimingUnit = "SECONDS" | "BARS" | "BAR_SEQUENCE";

export type CompetitionTimingProfile = {
  mode: CompetitionTimingMode;
  unit: TimingUnit;
  /** Primary competitive allotment when unit === SECONDS */
  durationSeconds: number | null;
  /** Bar count when unit === BARS */
  barCount: number | null;
  /** e.g. Trading Bars 8→8→4→4→2→2 */
  barSequence: readonly number[] | null;
  cypherRotationSecondsMin: number | null;
  cypherRotationSecondsMax: number | null;
  /** Regular Go Live must never use competitive forced takeover */
  competitiveTakeoverAllowed: boolean;
  label: string;
  notes: string;
};

export const TRADING_BARS_SEQUENCE = [8, 8, 4, 4, 2, 2] as const;

const PROFILES: Record<CompetitionTimingMode, CompetitionTimingProfile> = {
  BEAT_DRIVEN_RAP: {
    mode: "BEAT_DRIVEN_RAP",
    unit: "SECONDS",
    durationSeconds: 60,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Beat-driven Rap",
    notes: "Fast back-and-forth 60s performance slot",
  },
  ACAPELLA_FREESTYLE: {
    mode: "ACAPELLA_FREESTYLE",
    unit: "SECONDS",
    durationSeconds: 60,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Acapella Freestyle",
    notes: "60s default; short exchanges via ACAPELLA_SHORT_*",
  },
  ACAPELLA_SHORT_30: {
    mode: "ACAPELLA_SHORT_30",
    unit: "SECONDS",
    durationSeconds: 30,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Acapella Short 30",
    notes: "Authorized short exchange",
  },
  ACAPELLA_SHORT_45: {
    mode: "ACAPELLA_SHORT_45",
    unit: "SECONDS",
    durationSeconds: 45,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Acapella Short 45",
    notes: "Authorized short exchange",
  },
  SINGING_VOCAL: {
    mode: "SINGING_VOCAL",
    unit: "SECONDS",
    durationSeconds: 90,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Singing / Vocal",
    notes: "Verses and vocal runs",
  },
  DJ_TURNTABLES: {
    mode: "DJ_TURNTABLES",
    unit: "SECONDS",
    durationSeconds: 120,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "DJ / Turntables",
    notes: "Mixing and transitions",
  },
  INSTRUMENT_SOLO_45: {
    mode: "INSTRUMENT_SOLO_45",
    unit: "SECONDS",
    durationSeconds: 45,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Instrument Solo 45",
    notes: "Compact instrument class",
  },
  INSTRUMENT_SOLO_60: {
    mode: "INSTRUMENT_SOLO_60",
    unit: "SECONDS",
    durationSeconds: 60,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Instrument Solo 60",
    notes: "Standard instrument class",
  },
  INSTRUMENT_SOLO_120: {
    mode: "INSTRUMENT_SOLO_120",
    unit: "SECONDS",
    durationSeconds: 120,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Instrument Solo 120",
    notes: "Extended instrument / showcase class",
  },
  DRUMS_BARS_4: {
    mode: "DRUMS_BARS_4",
    unit: "BARS",
    durationSeconds: null,
    barCount: 4,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Drums 4-bar exchange",
    notes: "Requires event BPM/meter for wall-clock conversion",
  },
  DRUMS_BARS_8: {
    mode: "DRUMS_BARS_8",
    unit: "BARS",
    durationSeconds: null,
    barCount: 8,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Drums 8-bar exchange",
    notes: "Requires event BPM/meter for wall-clock conversion",
  },
  TRADING_BARS: {
    mode: "TRADING_BARS",
    unit: "BAR_SEQUENCE",
    durationSeconds: null,
    barCount: null,
    barSequence: TRADING_BARS_SEQUENCE,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Trading Bars",
    notes: "8→8→4→4→2→2 progression",
  },
  PRODUCER_BEAT_BATTLE: {
    mode: "PRODUCER_BEAT_BATTLE",
    unit: "SECONDS",
    durationSeconds: 90,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Producer / Beat Battle",
    notes: "Beat playback and presentation",
  },
  BAND_VS_BAND: {
    mode: "BAND_VS_BAND",
    unit: "SECONDS",
    durationSeconds: 180,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Band vs Band",
    notes: "Multi-musician ensemble set",
  },
  CYPHER_ROTATION: {
    mode: "CYPHER_ROTATION",
    unit: "SECONDS",
    durationSeconds: 60,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: 30,
    cypherRotationSecondsMax: 60,
    competitiveTakeoverAllowed: true,
    label: "Cypher Rotation",
    notes: "Timed turns; collaborative — no forced winner",
  },
  SONG_CHALLENGE: {
    mode: "SONG_CHALLENGE",
    unit: "SECONDS",
    durationSeconds: 120,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Song Challenge",
    notes: "Extended song excerpt; objective may override",
  },
  COMEDY_BATTLE: {
    mode: "COMEDY_BATTLE",
    unit: "SECONDS",
    durationSeconds: 60,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Comedy Battle",
    notes: "60s example profile",
  },
  OPEN_MIXED: {
    mode: "OPEN_MIXED",
    unit: "SECONDS",
    durationSeconds: 90,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Open Genre / Mixed",
    notes: "General-purpose default",
  },
  OBJECTIVE_CHALLENGE: {
    mode: "OBJECTIVE_CHALLENGE",
    unit: "SECONDS",
    durationSeconds: null,
    barCount: null,
    barSequence: null,
    cypherRotationSecondsMin: null,
    cypherRotationSecondsMax: null,
    competitiveTakeoverAllowed: true,
    label: "Objective Challenge",
    notes: "Duration defined by challenge objective / published event config",
  },
};

export function getTimingProfile(mode: CompetitionTimingMode): CompetitionTimingProfile {
  return PROFILES[mode];
}

export function listTimingProfiles(): CompetitionTimingProfile[] {
  return Object.values(PROFILES);
}

/**
 * Resolve profile from axes. Explicit `mode` / published `eventDurationSeconds` win.
 * Jazz saxophone ≠ Hip-Hop freestyle — never force one universal timer.
 */
export function resolveCompetitionTimingProfile(input: {
  mode?: CompetitionTimingMode | null;
  performerType?: CompetitionPerformerType | null;
  instrument?: CompetitionInstrument | null;
  genre?: string | null;
  formatId?: string | null;
  experienceKind?: string | null;
  /** Published event override — always authoritative when finite */
  eventDurationSeconds?: number | null;
  instrumentSoloClass?: "compact" | "standard" | "extended" | null;
  acapellaExchange?: "full" | "short30" | "short45" | null;
  drumBars?: 4 | 8 | null;
}): CompetitionTimingProfile {
  if (input.mode) return { ...PROFILES[input.mode] };

  const format = (input.formatId ?? "").toLowerCase();
  const exp = (input.experienceKind ?? "").toUpperCase();
  const genre = (input.genre ?? "").toLowerCase();

  if (exp.includes("CYPHER") || format.includes("cypher")) {
    return { ...PROFILES.CYPHER_ROTATION };
  }
  if (exp.includes("CHALLENGE") && !exp.includes("SONG")) {
    return { ...PROFILES.OBJECTIVE_CHALLENGE };
  }
  if (format.includes("trading") || format.includes("bars")) {
    return { ...PROFILES.TRADING_BARS };
  }
  if (format.includes("band") || input.performerType === "band" || input.instrument === "ensemble") {
    return { ...PROFILES.BAND_VS_BAND };
  }
  if (input.performerType === "dj" || input.instrument === "turntables" || format.includes("dj")) {
    return { ...PROFILES.DJ_TURNTABLES };
  }
  if (input.performerType === "producer" || format.includes("producer")) {
    return { ...PROFILES.PRODUCER_BEAT_BATTLE };
  }
  if (input.performerType === "comedian" || format.includes("comed") || format.includes("joke")) {
    return { ...PROFILES.COMEDY_BATTLE };
  }
  if (input.instrument === "drums" || format.includes("drum")) {
    return input.drumBars === 4 ? { ...PROFILES.DRUMS_BARS_4 } : { ...PROFILES.DRUMS_BARS_8 };
  }
  if (
    input.performerType === "instrumentalist" ||
    ["guitar", "piano", "saxophone", "violin", "bass"].includes(input.instrument ?? "")
  ) {
    const cls = input.instrumentSoloClass ?? (genre.includes("jazz") ? "extended" : "standard");
    if (cls === "compact") return { ...PROFILES.INSTRUMENT_SOLO_45 };
    if (cls === "extended") return { ...PROFILES.INSTRUMENT_SOLO_120 };
    return { ...PROFILES.INSTRUMENT_SOLO_60 };
  }
  if (input.performerType === "singer" || format.includes("singer") || format.includes("vocal")) {
    return { ...PROFILES.SINGING_VOCAL };
  }
  if (exp.includes("SONG") || format.includes("song-challenge")) {
    return { ...PROFILES.SONG_CHALLENGE };
  }
  if (input.performerType === "rapper" || format.includes("rap") || format.includes("freestyle")) {
    if (input.acapellaExchange === "short30") return { ...PROFILES.ACAPELLA_SHORT_30 };
    if (input.acapellaExchange === "short45") return { ...PROFILES.ACAPELLA_SHORT_45 };
    if (genre.includes("acapella") || format.includes("acapella")) {
      return { ...PROFILES.ACAPELLA_FREESTYLE };
    }
    return { ...PROFILES.BEAT_DRIVEN_RAP };
  }

  return { ...PROFILES.OPEN_MIXED };
}

/** Wall-clock seconds for AuthoritativeRoomTimingContract (bar modes need BPM). */
export function resolveRoundDurationSeconds(input: {
  profile: CompetitionTimingProfile;
  bpm?: number | null;
  meterBeatsPerBar?: number | null;
  eventDurationSeconds?: number | null;
  cypherPickSeconds?: number | null;
}): number {
  if (
    typeof input.eventDurationSeconds === "number" &&
    Number.isFinite(input.eventDurationSeconds) &&
    input.eventDurationSeconds > 0
  ) {
    return Math.round(input.eventDurationSeconds);
  }

  const profile = input.profile;
  if (profile.mode === "CYPHER_ROTATION") {
    const pick = input.cypherPickSeconds;
    if (typeof pick === "number" && pick >= 30 && pick <= 60) return Math.round(pick);
    return profile.durationSeconds ?? 60;
  }

  if (profile.unit === "SECONDS" && profile.durationSeconds != null) {
    return profile.durationSeconds;
  }

  const bpm = input.bpm;
  const beatsPerBar = input.meterBeatsPerBar ?? 4;
  if (typeof bpm === "number" && bpm >= 40 && bpm <= 300) {
    const barMs = (60 / bpm) * 1000 * beatsPerBar;
    if (profile.unit === "BARS" && profile.barCount != null) {
      return Math.max(1, Math.round((barMs * profile.barCount) / 1000));
    }
    if (profile.unit === "BAR_SEQUENCE" && profile.barSequence) {
      const totalBars = profile.barSequence.reduce((a, b) => a + b, 0);
      return Math.max(1, Math.round((barMs * totalBars) / 1000));
    }
  }

  // Objective / unresolved bar timing without BPM — honest fallback, not a fake genre clock
  return profile.durationSeconds ?? 90;
}
