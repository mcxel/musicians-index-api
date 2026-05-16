// Beat Submission Router — maps producer submissions to session pool eligibility
// Bridges: BeatQueueEngine genre pools ↔ RollingCypherBattleEngine rotation slots
// SSR-safe — pure functions, no side effects

import { GENRE_POOL_RULES, type BeatEntry, type BeatLicense } from "./BeatQueueEngine";
import { ROTATION_SCHEDULE, type RotationSlot } from "./RollingCypherBattleEngine";
import { getBeatRouting, type InstrumentClass } from "./BeatRoutingEngine";

// ── Submission input (mirrors BeatSubmitDto on the API side) ─────────────────

export type BeatSubmissionInput = {
  title: string;
  genre: string;
  bpm: number;
  key?: string;
  tags?: string[];
  producerId: string;
  producerName: string;
  battleUsable?: boolean;
  cypherUsable?: boolean;
  license?: BeatLicense;
  sponsorId?: string;
};

// ── Genre pool resolution ─────────────────────────────────────────────────────

export function resolveCompatibleGenres(genre: string): string[] {
  // Direct match
  if (GENRE_POOL_RULES[genre]) return [genre, ...(GENRE_POOL_RULES[genre] ?? [])].filter((v, i, arr) => arr.indexOf(v) === i);

  // Reverse lookup — find which pool this genre appears in as a subgenre
  const pools: string[] = [];
  for (const [poolGenre, subGenres] of Object.entries(GENRE_POOL_RULES)) {
    if (subGenres.includes(genre)) pools.push(poolGenre);
  }

  return pools.length > 0 ? [genre, ...pools] : [genre, "Open"];
}

// ── Session eligibility ───────────────────────────────────────────────────────

export type SessionEligibility = {
  slot: RotationSlot;
  reason: string;
};

export function getEligibleSessions(genre: string, battleUsable = true, cypherUsable = true): SessionEligibility[] {
  const compatible = resolveCompatibleGenres(genre);

  return ROTATION_SCHEDULE.filter((slot) => {
    if (slot.type === "battle" && !battleUsable) return false;
    if (slot.type === "cypher" && !cypherUsable) return false;
    return compatible.includes(slot.genre) || slot.genre === "Open" || slot.genre === "All Genres";
  }).map((slot) => ({
    slot,
    reason: slot.genre === "Open" || slot.genre === "All Genres" ? "Open pool" : `Genre match: ${slot.genre}`,
  }));
}

// ── Beat entry constructor ────────────────────────────────────────────────────

export function buildBeatEntryFromSubmission(
  input: BeatSubmissionInput,
  id: string,
): Omit<BeatEntry, "votes" | "skipCount" | "usageCount"> {
  const compatibleGenres = resolveCompatibleGenres(input.genre);

  // Infer compatible performance modes from instrument context
  // Default to beat-backed + acapella if we can't determine from tags
  const tags = input.tags ?? [];
  const mentionsInstrument = tags.some((t) =>
    ["guitar", "piano", "violin", "drum", "bass", "keys"].some((i) => t.toLowerCase().includes(i)),
  );

  const compatibleModes = mentionsInstrument
    ? (["beat-backed", "instrument-only", "instrument-beat"] as BeatEntry["compatibleModes"])
    : (["beat-backed", "acapella"] as BeatEntry["compatibleModes"]);

  return {
    id,
    title: input.title,
    genre: input.genre,
    energy: input.bpm >= 120 ? "high" : input.bpm >= 90 ? "mid" : "low",
    bpm: input.bpm,
    producerId: input.producerId,
    producerName: input.producerName,
    license: input.license ?? "producer-submitted",
    sponsorId: input.sponsorId,
    royaltyBps: 500,    // default 5% royalty for producer-submitted
    isActive: false,    // starts inactive — requires admin approval
    compatibleModes,
    compatibleGenres,
  };
}

// ── Instrument class resolver ─────────────────────────────────────────────────

export function inferInstrumentClass(tags: string[], genre: string): InstrumentClass {
  const allText = [...tags, genre].join(" ").toLowerCase();

  if (allText.includes("guitar") || allText.includes("rock")) return "guitarist";
  if (allText.includes("piano") || allText.includes("keys") || allText.includes("classical")) return "pianist";
  if (allText.includes("violin") || allText.includes("string")) return "violinist";
  if (allText.includes("drum")) return "drummer";
  if (allText.includes("bass")) return "bassist";
  if (allText.includes("sax")) return "saxophonist";
  if (allText.includes("rap") || allText.includes("trap") || allText.includes("drill") || allText.includes("hip-hop")) return "rapper";
  if (allText.includes("dj") || allText.includes("electronic") || allText.includes("house")) return "dj";
  if (allText.includes("producer") || allText.includes("beat")) return "producer";
  if (allText.includes("choir") || allText.includes("gospel")) return "choir";

  return "vocalist";
}

export function getRoutingForSubmission(tags: string[], genre: string) {
  const role = inferInstrumentClass(tags, genre);
  return { role, routing: getBeatRouting(role) };
}

// ── Submission summary (for UX display) ──────────────────────────────────────

export type SubmissionPreview = {
  compatibleGenres: string[];
  eligibleSessions: SessionEligibility[];
  inferredRole: InstrumentClass;
  poolSummary: string;
};

export function buildSubmissionPreview(
  genre: string,
  tags: string[],
  battleUsable = true,
  cypherUsable = true,
): SubmissionPreview {
  const compatibleGenres = resolveCompatibleGenres(genre);
  const eligibleSessions = getEligibleSessions(genre, battleUsable, cypherUsable);
  const { role: inferredRole } = getRoutingForSubmission(tags, genre);

  const sessionLabels = eligibleSessions.map((e) => e.slot.label);
  const poolSummary =
    sessionLabels.length === 0
      ? "No eligible sessions for this genre"
      : `Eligible for: ${sessionLabels.slice(0, 3).join(", ")}${sessionLabels.length > 3 ? ` +${sessionLabels.length - 3} more` : ""}`;

  return { compatibleGenres, eligibleSessions, inferredRole, poolSummary };
}
