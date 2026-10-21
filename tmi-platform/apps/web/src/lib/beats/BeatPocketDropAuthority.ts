/**
 * BeatPocketDropAuthority.ts
 *
 * TMI Musical Logistics & Pocket Drop Authority (Step 2B.1)
 *
 * Implements the 4-tier musical entry law:
 *   1. PRODUCER-DECLARED TRUSTWORTHY CUE (markerVerseA / markerIntro)
 *   2. VERIFIED MUSICAL ANALYSIS CUE (canonical verified transient/onset if present)
 *   3. BPM/BAR-SAFE FALLBACK (only when BPM + meter/time signature are verified trustworthy)
 *   4. TRUTHFUL ZERO FALLBACK (0:00 safe start when meter/cue is unknown; no fake skips)
 *
 * Absolute Invariants:
 * - Does NOT hard-code universal 8/16 bars, 4/4, or arbitrary 15s drops.
 * - Time signature is audited as missing from legacy Beat rows; NEVER assume 4/4 blindly.
 * - Safe looping requires explicit trustworthy boundaries (loopStart, loopEnd, or verified bar alignment).
 */

export type PocketDropTier =
  | "PRODUCER_DECLARED"
  | "VERIFIED_ANALYSIS"
  | "TRUTHFUL_ZERO_FALLBACK";

export interface PocketDropResolutionInput {
  beatId: string;
  markerIntro?: number | null;
  markerVerseA?: number | null;
  markerHook?: number | null;
  markerVerseB?: number | null;
  markerBridge?: number | null;
  markerOutro?: number | null;
  bpm?: number | null;
  timeSignature?: string | null; // e.g. "4/4", "3/4", "6/8"
  durationSeconds?: number | null;
  verifiedAnalysisCueMs?: number | null;
  formatCategory?: "battle" | "cypher" | "dance" | "challenge" | "showcase";
}

export interface PocketDropResolution {
  beatId: string;
  cueOffsetMs: number;
  cueOffsetSeconds: number;
  tier: PocketDropTier;
  isSafeLoopable: boolean;
  loopStartMs?: number;
  loopEndMs?: number;
  timeSignatureUsed?: string;
  rationale: string;
}

/**
 * Validates whether a time signature string is structurally sound and supported.
 * Example supported formats: "4/4", "3/4", "6/8", "12/8".
 */
export function parseTimeSignature(sig?: string | null): { numerator: number; denominator: number } | null {
  if (!sig || typeof sig !== "string") return null;
  const parts = sig.trim().split("/");
  if (parts.length !== 2) return null;
  const num = parseInt(parts[0]!, 10);
  const den = parseInt(parts[1]!, 10);
  if (isNaN(num) || isNaN(den) || num <= 0 || den <= 0) return null;
  if (![2, 3, 4, 6, 8, 12].includes(num) || ![2, 4, 8, 16].includes(den)) return null;
  return { numerator: num, denominator: den };
}

/**
 * Resolves the authoritative cue offset and musical pocket drop for competition playback.
 */
export function resolveBeatPocketDrop(input: PocketDropResolutionInput): PocketDropResolution {
  const {
    beatId,
    markerIntro,
    markerVerseA,
    markerHook,
    markerVerseB,
    bpm,
    timeSignature,
    durationSeconds,
    verifiedAnalysisCueMs,
  } = input;

  const maxTrackMs = durationSeconds && durationSeconds > 0 ? durationSeconds * 1000 : Infinity;

  // ─── TIER 1: PRODUCER-DECLARED TRUSTWORTHY CUE ─────────────────────────────
  // If the producer explicitly designated markerVerseA, that is the primary pocket entry.
  if (typeof markerVerseA === "number" && markerVerseA > 0 && markerVerseA < maxTrackMs) {
    const isLoopable =
      typeof markerHook === "number" && markerHook > markerVerseA && markerHook <= maxTrackMs;

    return {
      beatId,
      cueOffsetMs: markerVerseA,
      cueOffsetSeconds: Number((markerVerseA / 1000).toFixed(3)),
      tier: "PRODUCER_DECLARED",
      isSafeLoopable: isLoopable,
      loopStartMs: isLoopable ? markerVerseA : undefined,
      loopEndMs: isLoopable ? markerHook : undefined,
      timeSignatureUsed: timeSignature || undefined,
      rationale: `Producer-declared Verse A marker at ${markerVerseA}ms accepted as authoritative cue.`,
    };
  }

  // Fallback within Tier 1: markerIntro boundary (where intro ends and main beat drops)
  if (typeof markerIntro === "number" && markerIntro > 0 && markerIntro < maxTrackMs) {
    return {
      beatId,
      cueOffsetMs: markerIntro,
      cueOffsetSeconds: Number((markerIntro / 1000).toFixed(3)),
      tier: "PRODUCER_DECLARED",
      isSafeLoopable: false,
      timeSignatureUsed: timeSignature || undefined,
      rationale: `Producer-declared Intro boundary at ${markerIntro}ms accepted as authoritative cue.`,
    };
  }

  // ─── TIER 2: VERIFIED MUSICAL ANALYSIS CUE ────────────────────────────────
  // Canonical algorithmic onset/energy analysis if present from audio processing pipeline
  if (
    typeof verifiedAnalysisCueMs === "number" &&
    verifiedAnalysisCueMs > 0 &&
    verifiedAnalysisCueMs < maxTrackMs
  ) {
    return {
      beatId,
      cueOffsetMs: verifiedAnalysisCueMs,
      cueOffsetSeconds: Number((verifiedAnalysisCueMs / 1000).toFixed(3)),
      tier: "VERIFIED_ANALYSIS",
      isSafeLoopable: false,
      timeSignatureUsed: timeSignature || undefined,
      rationale: `Canonical verified musical analysis onset at ${verifiedAnalysisCueMs}ms applied.`,
    };
  }

  // ─── TIER 3 (REMOVED 2026-09-24, Step 2B.1 independent closure repair) ────
  // A prior revision of this authority skipped a hardcoded bar count once BPM
  // + time signature were verified ("battle/dance = 4 bars, cypher = 2 bars").
  // That mapping was never derived from any canonical TMI musical/competition
  // policy — no such policy exists anywhere in this codebase (audited: no
  // introBars/skipBars/barsBeforeDrop authority found outside this file) —
  // it simply replaced one arbitrary universal assumption with a second,
  // format-scoped arbitrary assumption. It was also structurally unreachable
  // in production: `timeSignature` is not a persisted Beat column today (not
  // in packages/db/prisma/schema.prisma), so no real caller could ever supply
  // a verified meter to this tier. Per Rule 20 and the explicit correction
  // that a truthful fallback must never fabricate an intro-skip length,
  // verified BPM/meter (when a future schema change makes it real) is not on
  // its own sufficient justification for a skip — it merely gets an honest,
  // distinguishable rationale in the zero fallback below. If TMI later
  // defines a real per-format/per-genre intro-skip policy authority, this is
  // the tier to reintroduce it against — never re-add a bare hardcoded
  // ternary in its place.

  // ─── TRUTHFUL ZERO FALLBACK ────────────────────────────────────────────
  // No trustworthy producer marker and no verified analysis cue. We FAIL
  // TRUTHFULLY to 0:00 without fabricating an arbitrary or desynced skip,
  // regardless of whether BPM/meter happen to be known.
  const parsedMeter = parseTimeSignature(timeSignature);
  const isValidBpm = typeof bpm === "number" && bpm >= 40 && bpm <= 300;

  const rationale =
    isValidBpm && parsedMeter
      ? `Verified ${parsedMeter.numerator}/${parsedMeter.denominator} meter at ${bpm} BPM is known, but no canonical TMI intro-skip policy exists for this format; truthful fallback to 0:00 rather than fabricating a skip length.`
      : `No trustworthy producer marker, verified analysis, ${!isValidBpm ? "trustworthy BPM, " : ""}${!parsedMeter ? "or verified time signature" : ""}; truthful fallback to 0:00 to prevent rhythmic misalignment.`;

  return {
    beatId,
    cueOffsetMs: 0,
    cueOffsetSeconds: 0,
    tier: "TRUTHFUL_ZERO_FALLBACK",
    isSafeLoopable: false,
    timeSignatureUsed: parsedMeter ? `${parsedMeter.numerator}/${parsedMeter.denominator}` : undefined,
    rationale,
  };
}
