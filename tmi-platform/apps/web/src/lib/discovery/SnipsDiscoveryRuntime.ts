/**
 * SnipsDiscoveryRuntime — swipe discovery references to canonical sources.
 * Pulls from PerformerRegistry public video/motion only (Rule 8 / Rule 20).
 */

import { PERFORMER_REGISTRY, type PerformerIdentity } from "@/lib/performers/PerformerRegistry";

export type SnipSourceKind =
  | "performer-moment"
  | "performance-highlight"
  | "video-shuffle-clip";

export interface SnipReference {
  id: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  thumbnailUrl?: string;
  sourceKind: SnipSourceKind;
  /** Canonical destination — never href="#". */
  destinationHref: string;
  attribution: string;
  performerSlug?: string;
}

function performerToSnip(p: PerformerIdentity, index: number): SnipReference | null {
  const videoUrl = p.introVideoUrl ?? p.motionPosterUrl ?? p.coverImageUrl ?? p.profileImageUrl;
  if (!videoUrl) return null;
  return {
    id: `snip-performer-${p.slug}`,
    title: p.name,
    subtitle: p.category,
    videoUrl,
    thumbnailUrl: p.profileImageUrl,
    sourceKind: "performer-moment",
    destinationHref: `/performers/${p.slug}`,
    attribution: p.name,
    performerSlug: p.slug,
  };
}

/** Build eligible public snip pool with diversity + anti-repetition shuffle. */
export function buildSnipPool(recentIds: string[] = []): SnipReference[] {
  const eligible = PERFORMER_REGISTRY.filter(
    (p) => Boolean(p.introVideoUrl || p.motionPosterUrl || p.coverImageUrl || p.profileImageUrl),
  )
    .map((p, i) => performerToSnip(p, i))
    .filter((s): s is SnipReference => s != null);

  const recent = new Set(recentIds.slice(-8));
  const fresh = eligible.filter((s) => !recent.has(s.id));
  const pool = fresh.length >= 3 ? fresh : eligible;

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool;
}

export function nextSnip(
  pool: SnipReference[],
  currentIndex: number,
  recentIds: string[],
): { index: number; snip: SnipReference | null; recentIds: string[] } {
  if (pool.length === 0) return { index: 0, snip: null, recentIds };
  const next = (currentIndex + 1) % pool.length;
  const snip = pool[next] ?? null;
  const updated = snip ? [...recentIds, snip.id].slice(-12) : recentIds;
  return { index: next, snip, recentIds: updated };
}

export function prevSnip(pool: SnipReference[], currentIndex: number): { index: number; snip: SnipReference | null } {
  if (pool.length === 0) return { index: 0, snip: null };
  const prev = (currentIndex - 1 + pool.length) % pool.length;
  return { index: prev, snip: pool[prev] ?? null };
}
