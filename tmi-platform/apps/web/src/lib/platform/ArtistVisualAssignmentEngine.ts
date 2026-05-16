/**
 * ArtistVisualAssignmentEngine
 * Single source-of-truth for artist image resolution.
 * All components call getArtistVisual(slug) — never hardcode image paths.
 */

const CURATED_POOL = [
  "/tmi-curated/mag-20.jpg",
  "/tmi-curated/mag-28.jpg",
  "/tmi-curated/mag-35.jpg",
  "/tmi-curated/mag-42.jpg",
  "/tmi-curated/mag-50.jpg",
  "/tmi-curated/mag-58.jpg",
  "/tmi-curated/mag-66.jpg",
  "/tmi-curated/mag-74.jpg",
  "/tmi-curated/mag-82.jpg",
];

const SLUG_OVERRIDES: Record<string, string> = {
  "ray-journey":    "/tmi-curated/mag-20.jpg",
  "lena-sky":       "/tmi-curated/mag-28.jpg",
  "nova-cipher":    "/tmi-curated/mag-35.jpg",
  "zuri-bloom":     "/tmi-curated/mag-42.jpg",
  "dj-storm":       "/tmi-curated/mag-50.jpg",
  "marcus-wave":    "/tmi-curated/mag-58.jpg",
  "wavetek":        "/tmi-curated/mag-66.jpg",
  "neon-vibe":      "/tmi-curated/mag-74.jpg",
  "krypt":          "/tmi-curated/mag-82.jpg",
  "astra-nova":     "/tmi-curated/mag-20.jpg",
  "wave-tek":       "/tmi-curated/mag-28.jpg",
  "lyric-stone":    "/tmi-curated/mag-42.jpg",
  "echo-dynasty":   "/tmi-curated/mag-50.jpg",
  "pulse-master":   "/tmi-curated/mag-58.jpg",
  "dj-lumi":        "/tmi-curated/mag-66.jpg",
  "bar-god":        "/tmi-curated/mag-74.jpg",
  "flow-master":    "/tmi-curated/mag-82.jpg",
  "verse-knight":   "/tmi-curated/mag-28.jpg",
};

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getArtistVisual(slug: string): string {
  if (SLUG_OVERRIDES[slug]) return SLUG_OVERRIDES[slug];
  return CURATED_POOL[hashSlug(slug) % CURATED_POOL.length];
}

export function getArtistVisualSet(slug: string, count: number): string[] {
  const base = hashSlug(slug);
  return Array.from({ length: count }, (_, i) =>
    CURATED_POOL[(base + i) % CURATED_POOL.length]
  );
}

export function getGenreVisual(genre: string): string {
  return CURATED_POOL[hashSlug(genre) % CURATED_POOL.length];
}
