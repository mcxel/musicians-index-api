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
  | "gibberish"
  | "scat"
  | "joke_off"
  | "dance_off"
  | "dirty_dozens"
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
  gibberish: "Gibberish",
  scat: "Scat",
  joke_off: "Joke-Off",
  dance_off: "Dance-Off",
  dirty_dozens: "Dirty Dozens",
  open_genre: "Open / Mixed",
  ai_music: "AI Music",
};

export function styleLabel(slot: PerformerStyleSlot | null | undefined): string {
  if (!slot) return "Open / Mixed";
  return PERFORMER_STYLE_LABEL[slot] ?? slot.replace(/_/g, " ");
}

/**
 * Like-with-like battle/challenge role (existing slots only — not a new taxonomy).
 * Mosaic: "Country Singer vs Country Singer" / "Pianist vs Pianist".
 */
export const PERFORMER_STYLE_VS_ROLE: Record<PerformerStyleSlot, string> = {
  hip_hop: "Hip-Hop Artist",
  rap: "Hip-Hop Artist",
  rnb: "R&B Singer",
  gospel: "Gospel Singer",
  pop: "Pop Singer",
  country: "Country Singer",
  rock: "Rock Artist",
  jazz: "Jazz Artist",
  latin: "Latin Artist",
  edm: "EDM Artist",
  dj: "DJ",
  producer: "Producer",
  band: "Band",
  drums: "Drums",
  guitar: "Guitar",
  horns: "Horns",
  keys: "Pianist",
  instrumental: "Instrumentalist",
  spoken_word: "Spoken Word",
  dance: "Dancer",
  comedy: "Comedian",
  gibberish: "Gibberish",
  scat: "Scat",
  joke_off: "Joke-Off",
  dance_off: "Dance-Off",
  dirty_dozens: "Dirty Dozens",
  open_genre: "Open Genre",
  ai_music: "AI Music",
};

export function styleVsRole(slot: PerformerStyleSlot | null | undefined): string {
  if (!slot) return PERFORMER_STYLE_VS_ROLE.open_genre;
  return PERFORMER_STYLE_VS_ROLE[slot] ?? styleLabel(slot);
}

/** Matchup pair from one canonical slot — never mixed styles. */
export function styleVsCallout(slot: PerformerStyleSlot | null | undefined): string {
  const role = styleVsRole(slot);
  return `${role} vs ${role}`;
}

/** Recruiting batches: 3 matchup types at a time. */
export const CALLOUT_BATCH_SIZE = 3;

export type CalloutFamily =
  | "vocal"
  | "rap"
  | "dance"
  | "instrument"
  | "band"
  | "comedy"
  | "dj"
  | "producer"
  | "spoken"
  | "quirky"
  | "joke_off"
  | "dance_off"
  | "dozens"
  | "open";

/** Unlike-with-unlike across a 3-callout batch (like-vs-like within each line). */
export const STYLE_CALLOUT_FAMILY: Record<PerformerStyleSlot, CalloutFamily> = {
  hip_hop: "rap",
  rap: "rap",
  rnb: "vocal",
  gospel: "vocal",
  pop: "vocal",
  country: "vocal",
  rock: "vocal",
  jazz: "vocal",
  latin: "vocal",
  edm: "dj",
  dj: "dj",
  producer: "producer",
  band: "band",
  drums: "instrument",
  guitar: "instrument",
  horns: "instrument",
  keys: "instrument",
  instrumental: "instrument",
  spoken_word: "spoken",
  dance: "dance",
  comedy: "comedy",
  gibberish: "quirky",
  scat: "quirky",
  joke_off: "joke_off",
  dance_off: "dance_off",
  dirty_dozens: "dozens",
  open_genre: "open",
  ai_music: "open",
};

export function pickStyleBatch(
  pool: readonly PerformerStyleSlot[],
  cursor: number,
  size: number = CALLOUT_BATCH_SIZE,
): { slots: PerformerStyleSlot[]; nextCursor: number } {
  if (!pool.length) return { slots: [], nextCursor: 0 };
  const n = Math.min(Math.max(1, size), pool.length);
  const start = ((cursor % pool.length) + pool.length) % pool.length;
  const slots: PerformerStyleSlot[] = [];
  for (let i = 0; i < n; i++) {
    slots.push(pool[(start + i) % pool.length]!);
  }
  return { slots, nextCursor: (start + n) % pool.length };
}

/**
 * 3-at-a-time recruiting: prefer different families so one room can call
 * dancer vs dancer + gibberish vs gibberish + sax/horns vs sax in the same batch.
 */
export function pickUnlikeStyleBatch(
  pool: readonly PerformerStyleSlot[],
  cursor: number,
  size: number = CALLOUT_BATCH_SIZE,
): { slots: PerformerStyleSlot[]; nextCursor: number } {
  if (!pool.length) return { slots: [], nextCursor: 0 };
  const n = Math.min(Math.max(1, size), pool.length);
  const start = ((cursor % pool.length) + pool.length) % pool.length;
  const slots: PerformerStyleSlot[] = [];
  const used = new Set<CalloutFamily>();
  const scan = pool.length * 2;
  for (let i = 0; i < scan && slots.length < n; i++) {
    const slot = pool[(start + i) % pool.length]!;
    const fam = STYLE_CALLOUT_FAMILY[slot] ?? "open";
    if (used.has(fam) && used.size < n) continue;
    if (slots.includes(slot)) continue;
    slots.push(slot);
    used.add(fam);
  }
  for (let j = 0; j < pool.length && slots.length < n; j++) {
    const slot = pool[(start + j) % pool.length]!;
    if (!slots.includes(slot)) slots.push(slot);
  }
  return { slots, nextCursor: (start + n) % pool.length };
}

export function formatVsTripleCallout(slots: readonly PerformerStyleSlot[]): string {
  return slots.map((s) => styleVsCallout(s)).join(" · ");
}

export function formatCypherTripleCallout(slots: readonly PerformerStyleSlot[]): string {
  return slots.map((s) => `${styleLabel(s)} Cypher`).join(" · ");
}

export function encodeCalloutBatch(slots: readonly PerformerStyleSlot[]): string {
  return slots.join(",");
}

export function parseCalloutBatch(raw: string | null | undefined): PerformerStyleSlot[] {
  if (!raw?.trim()) return [];
  const known = new Set<string>(Object.keys(PERFORMER_STYLE_LABEL));
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is PerformerStyleSlot => known.has(s));
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
  "gibberish",
  "scat",
  "spoken_word",
  "open_genre",
] as const;

/**
 * Battle-section randomizer — every performer/instrument style plus existing
 * specialty battle formats (joke-off, dance-off, dirty dozens). Not a new engine.
 */
export const BATTLE_SECTION_ROTATION_POOL: readonly PerformerStyleSlot[] = [
  ...FULL_STYLE_ROTATION_POOL,
  "joke_off",
  "dance_off",
  "dirty_dozens",
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
