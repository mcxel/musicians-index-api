/**
 * Shared performer-style slots for Battle / Cypher / Gauntlet / Challenge idle rotation.
 * Not hip-hop-only — vocalists, bands, DJs, producers, instrumentalists, dance, comedy, open.
 */

export type PerformerStyleSlot =
  | "hip_hop"
  | "rap"
  | "rnb"
  | "gospel"
  | "pop"
  | "country"
  | "rock"
  | "jazz"
  | "latin"
  | "edm"
  | "dj"
  | "producer"
  | "band"
  | "drums"
  | "guitar"
  | "horns"
  | "keys"
  | "instrumental"
  | "spoken_word"
  | "dance"
  | "comedy"
  | "open_genre"
  | "ai_music";

export const PERFORMER_STYLE_LABEL: Record<PerformerStyleSlot, string> = {
  hip_hop: "Hip-Hop",
  rap: "Rap / Freestyle",
  rnb: "R&B",
  gospel: "Gospel",
  pop: "Pop",
  country: "Country",
  rock: "Rock",
  jazz: "Jazz",
  latin: "Latin",
  edm: "EDM",
  dj: "DJ",
  producer: "Producer / Beatmaker",
  band: "Band / Group",
  drums: "Drums",
  guitar: "Guitar",
  horns: "Horns",
  keys: "Keys",
  instrumental: "Instrumental",
  spoken_word: "Spoken Word",
  dance: "Dance",
  comedy: "Comedy",
  open_genre: "Open / Mixed",
  ai_music: "AI Music",
};

export function styleLabel(slot: PerformerStyleSlot | null | undefined): string {
  if (!slot) return "Open / Mixed";
  return PERFORMER_STYLE_LABEL[slot] ?? slot.replace(/_/g, " ");
}

/** Advance one slot in a pool (idle rotation). Never repeats the same index. */
export function nextStyleInPool(
  pool: readonly PerformerStyleSlot[],
  current: PerformerStyleSlot | null | undefined,
): PerformerStyleSlot {
  if (!pool.length) return "open_genre";
  const idx = Math.max(0, pool.indexOf((current ?? pool[0]) as PerformerStyleSlot));
  return pool[(idx + 1) % pool.length] ?? pool[0];
}

/** Full creative mix — use for rotating anchors that should feel varied. */
export const FULL_STYLE_ROTATION_POOL: readonly PerformerStyleSlot[] = [
  "hip_hop",
  "rnb",
  "rock",
  "country",
  "gospel",
  "pop",
  "jazz",
  "latin",
  "edm",
  "dj",
  "producer",
  "band",
  "drums",
  "guitar",
  "horns",
  "keys",
  "instrumental",
  "dance",
  "comedy",
  "spoken_word",
  "open_genre",
] as const;

/** Instrumentalist-heavy mix for gauntlet / instrumental cyphers. */
export const INSTRUMENTALIST_ROTATION_POOL: readonly PerformerStyleSlot[] = [
  "drums",
  "guitar",
  "horns",
  "keys",
  "instrumental",
  "band",
  "jazz",
  "rock",
  "open_genre",
] as const;
