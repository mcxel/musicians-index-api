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
