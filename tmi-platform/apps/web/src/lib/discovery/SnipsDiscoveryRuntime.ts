/**
 * SnipsDiscoveryRuntime — swipe discovery over permanent public Snips catalog.
 * Default order: NEWEST_FIRST (§10630). No shuffle; no age TTL.
 * Sponsored / People You May Know are separate insertions — not organic chronology.
 */

import {
  ensurePublicSnipsCatalogBootstrapped,
  listPublicSnipsNewestFirst,
  pagePublicSnipsNewestFirst,
  type PublicSnipRecord,
} from "@/lib/discovery/PublicSnipsCatalogCore";

export type SnipSourceKind =
  | "performer-moment"
  | "performance-highlight"
  | "video-shuffle-clip"
  | "member-published";

export interface SnipReference {
  id: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  thumbnailUrl?: string;
  sourceKind: SnipSourceKind;
  destinationHref: string;
  attribution: string;
  performerSlug?: string;
  publishedAt: number;
  caption?: string;
  tags?: string[];
}

function recordToReference(rec: PublicSnipRecord): SnipReference {
  return {
    id: rec.snipId,
    title: rec.title,
    subtitle: rec.caption?.slice(0, 80) || "Snip",
    videoUrl: rec.videoUrl,
    thumbnailUrl: rec.thumbnailUrl,
    sourceKind: rec.snipId.startsWith("snip-performer-") ? "performer-moment" : "member-published",
    destinationHref: rec.destinationHref,
    attribution: rec.creatorDisplayName,
    performerSlug: rec.creatorSlug,
    publishedAt: rec.publishedAt,
    caption: rec.caption,
    tags: rec.tags,
  };
}

/**
 * Build public snip pool newest-first.
 * `recentIds` used only to de-prioritize immediate repeats within a session window —
 * never deletes older catalog entries.
 */
export function buildSnipPool(recentIds: string[] = []): SnipReference[] {
  ensurePublicSnipsCatalogBootstrapped();
  const all = listPublicSnipsNewestFirst().map(recordToReference);
  if (recentIds.length === 0) return all;
  const recent = new Set(recentIds.slice(-8));
  const fresh = all.filter((s) => !recent.has(s.id));
  // Prefer unseen at front, then already-seen deeper — catalog unchanged.
  return fresh.length > 0 ? [...fresh, ...all.filter((s) => recent.has(s.id))] : all;
}

export function nextSnip(
  pool: SnipReference[],
  currentIndex: number,
  recentIds: string[],
): { index: number; snip: SnipReference | null; recentIds: string[] } {
  if (pool.length === 0) return { index: 0, snip: null, recentIds };
  const next = Math.min(currentIndex + 1, pool.length - 1);
  // Prefer advancing deeper (older) rather than wrapping to newest unless at end.
  const index = currentIndex >= pool.length - 1 ? 0 : next;
  const snip = pool[index] ?? null;
  const updated = snip ? [...recentIds, snip.id].slice(-12) : recentIds;
  return { index, snip, recentIds: updated };
}

export function prevSnip(
  pool: SnipReference[],
  currentIndex: number,
): { index: number; snip: SnipReference | null } {
  if (pool.length === 0) return { index: 0, snip: null };
  const prev = currentIndex <= 0 ? pool.length - 1 : currentIndex - 1;
  return { index: prev, snip: pool[prev] ?? null };
}

export function pageSnipsFeed(opts?: { limit?: number; cursor?: string | null }) {
  return pagePublicSnipsNewestFirst(opts);
}
