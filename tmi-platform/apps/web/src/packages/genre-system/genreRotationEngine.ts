import { getAllGenres, isMajorGenre } from "@/packages/genre-system/genreRegistry";

let rotationIndex = 0;
let lastGenre = "Hip Hop";
let rotationOrder: string[] = [];

function refreshRotationOrder(): string[] {
  const genres = getAllGenres();
  const major = genres.filter((genre) => isMajorGenre(genre));
  const niche = genres.filter((genre) => !isMajorGenre(genre));

  const balanced: string[] = [];
  const max = Math.max(major.length, niche.length);

  for (let i = 0; i < max; i += 1) {
    if (major[i]) balanced.push(major[i]);
    if (niche[i]) balanced.push(niche[i]);
  }

  rotationOrder = balanced.length > 0 ? balanced : genres;
  return rotationOrder;
}

function getRotationOrder(): string[] {
  if (rotationOrder.length === 0) {
    return refreshRotationOrder();
  }

  const knownGenres = getAllGenres();
  const missing = knownGenres.some((genre) => !rotationOrder.includes(genre));
  if (missing) {
    return refreshRotationOrder();
  }

  return rotationOrder;
}

export function getCurrentGenre(): string {
  return lastGenre;
}

export function getNextGenre(): string {
  const order = getRotationOrder();
  if (order.length === 0) {
    return "Hip Hop";
  }

  let candidate = order[rotationIndex % order.length];
  rotationIndex = (rotationIndex + 1) % order.length;

  if (candidate === lastGenre && order.length > 1) {
    candidate = order[rotationIndex % order.length];
    rotationIndex = (rotationIndex + 1) % order.length;
  }

  lastGenre = candidate;
  return candidate;
}

export function peekRotationWindow(size = 6): string[] {
  const order = getRotationOrder();
  if (order.length === 0) {
    return [];
  }

  const start = rotationIndex % order.length;
  const result: string[] = [];

  for (let offset = 0; offset < size; offset += 1) {
    result.push(order[(start + offset) % order.length]);
  }

  return result;
}

// ─── Weekly genre + orbit variant (deterministic per ISO week+year) ───────────

function getISOWeekSeed(): number {
  const now = new Date();
  const year = now.getFullYear();
  // Jan 4 is always in ISO week 1
  const startOfYear = new Date(year, 0, 4).getTime();
  const dayOffset = Math.floor((now.getTime() - startOfYear) / 86400000);
  const week = Math.max(0, Math.floor(dayOffset / 7));
  return year * 53 + week;
}

/**
 * Returns the genre featured on the Home 1 orbit this ISO week.
 * Deterministic: same genre for all visitors in the same calendar week.
 */
export function getWeeklyGenre(): string {
  const seed = getISOWeekSeed();
  const genres = getAllGenres();
  return genres[seed % genres.length] ?? "Hip Hop";
}

export type OrbitVariant = {
  name: string;
  radX: number;      // orbit ellipse radius X (% of stage)
  radY: number;      // orbit ellipse radius Y (% of stage)
  speedMult: number; // multiplier on base ROTATION_SPEED
};

const ORBIT_VARIANTS: OrbitVariant[] = [
  { name: "galaxy",      radX: 24, radY: 24, speedMult: 1.0 },
  { name: "wide-sweep",  radX: 32, radY: 16, speedMult: 0.9 },
  { name: "tall-tower",  radX: 16, radY: 30, speedMult: 1.1 },
  { name: "tight-crown", radX: 18, radY: 18, speedMult: 1.3 },
  { name: "grand-sweep", radX: 36, radY: 26, speedMult: 0.8 },
  { name: "wide-diamond",radX: 28, radY: 20, speedMult: 1.2 },
];

/**
 * Returns the orbit shape configuration for this ISO week.
 * Changes shape weekly so the orbit looks different each visit.
 */
export function getWeeklyOrbitVariant(): OrbitVariant {
  const seed = getISOWeekSeed();
  return ORBIT_VARIANTS[seed % ORBIT_VARIANTS.length]!;
}
